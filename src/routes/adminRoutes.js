const express = require('express');
const { query, getOne } = require('../config/db');
const { requireAuth, authorize } = require('../middleware/auth');
const {
  uploadImage,
  optimizeImage,
  publicUploadPath,
  removeUploadedFile
} = require('../config/upload');
const {
  cleanString,
  normalizeStatus,
  requireFields,
  setFlash
} = require('../middleware/validators');
const { hashPassword } = require('../utils/password');
const { logActivity } = require('../utils/activityLogger');
const { buildEmbedUrl } = require('../utils/video');
const {
  formatDate,
  formatDateTime,
  dateInputValue,
  excerpt,
  nl2br
} = require('../utils/formatters');

const router = express.Router();
const editorRoles = ['Super Admin', 'Content Editor'];
const allRoles = ['Super Admin', 'Content Editor', 'Viewer'];
const helpers = { formatDate, formatDateTime, dateInputValue, excerpt, nl2br };

router.use(requireAuth);

router.get('/dashboard', authorize(...allRoles), async (req, res, next) => {
  try {
    const [legacyStats, storyStats, imageStats, messageStats, pageStats, donationStats, eventStats, videoStats, recentLogs] = await Promise.all([
      getOne(`SELECT COUNT(*) AS total FROM legacy_entries`),
      getOne(`SELECT COUNT(*) AS total FROM caregiver_stories`),
      getOne(`SELECT COUNT(*) AS total FROM gallery_images`),
      getOne(`SELECT COUNT(*) AS total FROM contact_messages`),
      getOne(
        `SELECT
          SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) AS published_pages,
          COUNT(*) AS total_pages
         FROM pages`
      ),
      getOne(`SELECT COUNT(*) AS total FROM donation_records`),
      getOne(`SELECT COUNT(*) AS total FROM events`),
      getOne(`SELECT COUNT(*) AS total FROM site_videos`),
      query(
        `SELECT al.*, au.full_name
         FROM activity_logs al
         LEFT JOIN admin_users au ON au.admin_id = al.admin_id
         ORDER BY al.created_at DESC
         LIMIT 8`
      )
    ]);

    const publishedContent = await getOne(
      `SELECT
        (SELECT COUNT(*) FROM pages WHERE status = 'Published') +
        (SELECT COUNT(*) FROM legacy_entries WHERE status = 'Published') +
        (SELECT COUNT(*) FROM caregiver_stories WHERE status = 'Published') +
        (SELECT COUNT(*) FROM gallery_images WHERE status = 'Published') +
        (SELECT COUNT(*) FROM events WHERE status = 'Published') +
        (SELECT COUNT(*) FROM site_videos WHERE status = 'Published') AS total`
    );

    res.render('admin/dashboard', {
      title: 'Dashboard',
      stats: {
        legacy: legacyStats.total,
        stories: storyStats.total,
        images: imageStats.total,
        messages: messageStats.total,
        pages: pageStats.total_pages,
        donations: donationStats.total,
        events: eventStats.total,
        videos: videoStats.total,
        published: publishedContent.total
      },
      recentLogs,
      helpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/pages', authorize(...editorRoles), async (req, res, next) => {
  try {
    const pages = await query(`SELECT * FROM pages ORDER BY page_name ASC`);
    res.render('admin/pages/index', { title: 'Manage Pages', pages, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/pages/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const page = await getOne(`SELECT * FROM pages WHERE page_id = :id`, { id: req.params.id });
    if (!page) {
      setFlash(req, 'warning', 'Page not found.');
      return res.redirect('/admin/pages');
    }
    return res.render('admin/pages/edit', { title: `Edit ${page.page_name}`, page });
  } catch (error) {
    return next(error);
  }
});

router.post('/pages/:id', authorize(...editorRoles), async (req, res, next) => {
  try {
    const page = {
      id: req.params.id,
      title: cleanString(req.body.title),
      content: cleanString(req.body.content),
      status: normalizeStatus(req.body.status)
    };
    const errors = requireFields(page, ['title', 'content']);
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect(`/admin/pages/${page.id}/edit`);
    }

    await query(
      `UPDATE pages
       SET title = :title, content = :content, status = :status
       WHERE page_id = :id`,
      page
    );
    await logActivity(req, 'Updated page content', 'pages', page.id);
    setFlash(req, 'success', 'Page content updated.');
    return res.redirect('/admin/pages');
  } catch (error) {
    return next(error);
  }
});

router.get('/legacy', authorize(...editorRoles), async (req, res, next) => {
  try {
    const entries = await query(
      `SELECT le.*, au.full_name AS creator_name
       FROM legacy_entries le
       LEFT JOIN admin_users au ON au.admin_id = le.created_by
       ORDER BY le.display_order ASC, le.milestone_date DESC`
    );
    res.render('admin/legacy/index', { title: 'Legacy Content', entries, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/legacy/new', authorize(...editorRoles), (req, res) => {
  res.render('admin/legacy/form', {
    title: 'New Legacy Entry',
    entry: {},
    action: '/admin/legacy',
    helpers
  });
});

router.post(
  '/legacy',
  authorize(...editorRoles),
  uploadImage.single('image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const entry = {
        title: cleanString(req.body.title),
        content: cleanString(req.body.content),
        milestone_date: cleanString(req.body.milestone_date) || null,
        image_path: publicUploadPath(req.file),
        display_order: Number(req.body.display_order || 0),
        status: normalizeStatus(req.body.status),
        created_by: req.session.user.admin_id
      };

      const errors = requireFields(entry, ['title', 'content']);
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect('/admin/legacy/new');
      }

      const result = await query(
        `INSERT INTO legacy_entries
          (title, content, milestone_date, image_path, display_order, status, created_by)
         VALUES
          (:title, :content, :milestone_date, :image_path, :display_order, :status, :created_by)`,
        entry
      );
      await logActivity(req, 'Created legacy entry', 'legacy_entries', result.insertId);
      setFlash(req, 'success', 'Legacy entry created.');
      return res.redirect('/admin/legacy');
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/legacy/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const entry = await getOne(`SELECT * FROM legacy_entries WHERE legacy_id = :id`, { id: req.params.id });
    if (!entry) {
      setFlash(req, 'warning', 'Legacy entry not found.');
      return res.redirect('/admin/legacy');
    }
    return res.render('admin/legacy/form', {
      title: 'Edit Legacy Entry',
      entry,
      action: `/admin/legacy/${entry.legacy_id}`,
      helpers
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/legacy/:id',
  authorize(...editorRoles),
  uploadImage.single('image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const existing = await getOne(`SELECT * FROM legacy_entries WHERE legacy_id = :id`, { id: req.params.id });
      if (!existing) {
        setFlash(req, 'warning', 'Legacy entry not found.');
        return res.redirect('/admin/legacy');
      }

      const uploadedPath = publicUploadPath(req.file);
      const entry = {
        id: req.params.id,
        title: cleanString(req.body.title),
        content: cleanString(req.body.content),
        milestone_date: cleanString(req.body.milestone_date) || null,
        image_path: uploadedPath || existing.image_path,
        display_order: Number(req.body.display_order || 0),
        status: normalizeStatus(req.body.status)
      };

      const errors = requireFields(entry, ['title', 'content']);
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect(`/admin/legacy/${entry.id}/edit`);
      }

      await query(
        `UPDATE legacy_entries
         SET title = :title,
             content = :content,
             milestone_date = :milestone_date,
             image_path = :image_path,
             display_order = :display_order,
             status = :status
         WHERE legacy_id = :id`,
        entry
      );
      if (uploadedPath && existing.image_path !== uploadedPath) removeUploadedFile(existing.image_path);
      await logActivity(req, 'Updated legacy entry', 'legacy_entries', entry.id);
      setFlash(req, 'success', 'Legacy entry updated.');
      return res.redirect('/admin/legacy');
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/legacy/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    const existing = await getOne(`SELECT * FROM legacy_entries WHERE legacy_id = :id`, { id: req.params.id });
    if (existing) {
      await query(`DELETE FROM legacy_entries WHERE legacy_id = :id`, { id: req.params.id });
      removeUploadedFile(existing.image_path);
      await logActivity(req, 'Deleted legacy entry', 'legacy_entries', req.params.id);
    }
    setFlash(req, 'success', 'Legacy entry deleted.');
    return res.redirect('/admin/legacy');
  } catch (error) {
    return next(error);
  }
});

router.get('/stories', authorize(...editorRoles), async (req, res, next) => {
  try {
    const stories = await query(
      `SELECT cs.*, au.full_name AS creator_name
       FROM caregiver_stories cs
       LEFT JOIN admin_users au ON au.admin_id = cs.created_by
       ORDER BY cs.published_at DESC, cs.created_at DESC`
    );
    res.render('admin/stories/index', { title: 'Caregiver Stories', stories, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/stories/new', authorize(...editorRoles), (req, res) => {
  res.render('admin/stories/form', {
    title: 'New Caregiver Story',
    story: {},
    action: '/admin/stories',
    helpers
  });
});

router.post(
  '/stories',
  authorize(...editorRoles),
  uploadImage.single('featured_image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const story = {
        title: cleanString(req.body.title),
        author_name: cleanString(req.body.author_name),
        author_role: cleanString(req.body.author_role),
        content: cleanString(req.body.content),
        featured_image_path: publicUploadPath(req.file),
        status: normalizeStatus(req.body.status),
        created_by: req.session.user.admin_id,
        published_at: cleanString(req.body.published_at)
          ? `${cleanString(req.body.published_at)} 09:00:00`
          : null
      };

      const errors = requireFields(story, ['title', 'author_name', 'author_role', 'content']);
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect('/admin/stories/new');
      }

      const result = await query(
        `INSERT INTO caregiver_stories
          (title, author_name, author_role, content, featured_image_path, status, created_by, published_at)
         VALUES
          (:title, :author_name, :author_role, :content, :featured_image_path, :status, :created_by, :published_at)`,
        story
      );
      await logActivity(req, 'Created caregiver story', 'caregiver_stories', result.insertId);
      setFlash(req, 'success', 'Caregiver story created.');
      return res.redirect('/admin/stories');
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/stories/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const story = await getOne(`SELECT * FROM caregiver_stories WHERE story_id = :id`, { id: req.params.id });
    if (!story) {
      setFlash(req, 'warning', 'Caregiver story not found.');
      return res.redirect('/admin/stories');
    }
    return res.render('admin/stories/form', {
      title: 'Edit Caregiver Story',
      story,
      action: `/admin/stories/${story.story_id}`,
      helpers
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/stories/:id',
  authorize(...editorRoles),
  uploadImage.single('featured_image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const existing = await getOne(`SELECT * FROM caregiver_stories WHERE story_id = :id`, { id: req.params.id });
      if (!existing) {
        setFlash(req, 'warning', 'Caregiver story not found.');
        return res.redirect('/admin/stories');
      }

      const uploadedPath = publicUploadPath(req.file);
      const story = {
        id: req.params.id,
        title: cleanString(req.body.title),
        author_name: cleanString(req.body.author_name),
        author_role: cleanString(req.body.author_role),
        content: cleanString(req.body.content),
        featured_image_path: uploadedPath || existing.featured_image_path,
        status: normalizeStatus(req.body.status),
        published_at: cleanString(req.body.published_at)
          ? `${cleanString(req.body.published_at)} 09:00:00`
          : null
      };

      const errors = requireFields(story, ['title', 'author_name', 'author_role', 'content']);
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect(`/admin/stories/${story.id}/edit`);
      }

      await query(
        `UPDATE caregiver_stories
         SET title = :title,
             author_name = :author_name,
             author_role = :author_role,
             content = :content,
             featured_image_path = :featured_image_path,
             status = :status,
             published_at = :published_at
         WHERE story_id = :id`,
        story
      );
      if (uploadedPath && existing.featured_image_path !== uploadedPath) removeUploadedFile(existing.featured_image_path);
      await logActivity(req, 'Updated caregiver story', 'caregiver_stories', story.id);
      setFlash(req, 'success', 'Caregiver story updated.');
      return res.redirect('/admin/stories');
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/stories/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    const existing = await getOne(`SELECT * FROM caregiver_stories WHERE story_id = :id`, { id: req.params.id });
    if (existing) {
      await query(`DELETE FROM caregiver_stories WHERE story_id = :id`, { id: req.params.id });
      removeUploadedFile(existing.featured_image_path);
      await logActivity(req, 'Deleted caregiver story', 'caregiver_stories', req.params.id);
    }
    setFlash(req, 'success', 'Caregiver story deleted.');
    return res.redirect('/admin/stories');
  } catch (error) {
    return next(error);
  }
});

router.get('/gallery', authorize(...editorRoles), async (req, res, next) => {
  try {
    const [categories, images] = await Promise.all([
      query(
        `SELECT gc.*, COUNT(gi.image_id) AS image_count
         FROM gallery_categories gc
         LEFT JOIN gallery_images gi ON gi.category_id = gc.category_id
         GROUP BY gc.category_id
         ORDER BY gc.category_name ASC`
      ),
      query(
        `SELECT gi.*, gc.category_name, au.full_name AS uploader_name
         FROM gallery_images gi
         JOIN gallery_categories gc ON gc.category_id = gi.category_id
         LEFT JOIN admin_users au ON au.admin_id = gi.uploaded_by
         ORDER BY gi.created_at DESC`
      )
    ]);
    res.render('admin/gallery/index', { title: 'Gallery', categories, images, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/gallery/categories/new', authorize(...editorRoles), (req, res) => {
  res.render('admin/gallery/category-form', {
    title: 'New Gallery Category',
    category: {},
    action: '/admin/gallery/categories'
  });
});

router.post('/gallery/categories', authorize(...editorRoles), async (req, res, next) => {
  try {
    const category = {
      category_name: cleanString(req.body.category_name),
      description: cleanString(req.body.description)
    };
    const errors = requireFields(category, ['category_name']);
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect('/admin/gallery/categories/new');
    }

    const result = await query(
      `INSERT INTO gallery_categories (category_name, description)
       VALUES (:category_name, :description)`,
      category
    );
    await logActivity(req, 'Created gallery category', 'gallery_categories', result.insertId);
    setFlash(req, 'success', 'Gallery category created.');
    return res.redirect('/admin/gallery');
  } catch (error) {
    return next(error);
  }
});

router.get('/gallery/categories/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const category = await getOne(`SELECT * FROM gallery_categories WHERE category_id = :id`, { id: req.params.id });
    if (!category) {
      setFlash(req, 'warning', 'Gallery category not found.');
      return res.redirect('/admin/gallery');
    }
    return res.render('admin/gallery/category-form', {
      title: 'Edit Gallery Category',
      category,
      action: `/admin/gallery/categories/${category.category_id}`
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/gallery/categories/:id', authorize(...editorRoles), async (req, res, next) => {
  try {
    const category = {
      id: req.params.id,
      category_name: cleanString(req.body.category_name),
      description: cleanString(req.body.description)
    };
    const errors = requireFields(category, ['category_name']);
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect(`/admin/gallery/categories/${category.id}/edit`);
    }

    await query(
      `UPDATE gallery_categories
       SET category_name = :category_name, description = :description
       WHERE category_id = :id`,
      category
    );
    await logActivity(req, 'Updated gallery category', 'gallery_categories', category.id);
    setFlash(req, 'success', 'Gallery category updated.');
    return res.redirect('/admin/gallery');
  } catch (error) {
    return next(error);
  }
});

router.post('/gallery/categories/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    const imageCount = await getOne(
      `SELECT COUNT(*) AS total FROM gallery_images WHERE category_id = :id`,
      { id: req.params.id }
    );
    if (imageCount.total > 0) {
      setFlash(req, 'warning', 'Move or delete images in this category first.');
      return res.redirect('/admin/gallery');
    }
    await query(`DELETE FROM gallery_categories WHERE category_id = :id`, { id: req.params.id });
    await logActivity(req, 'Deleted gallery category', 'gallery_categories', req.params.id);
    setFlash(req, 'success', 'Gallery category deleted.');
    return res.redirect('/admin/gallery');
  } catch (error) {
    return next(error);
  }
});

router.get('/gallery/images/new', authorize(...editorRoles), async (req, res, next) => {
  try {
    const categories = await query(`SELECT * FROM gallery_categories ORDER BY category_name ASC`);
    res.render('admin/gallery/image-form', {
      title: 'New Gallery Image',
      image: {},
      categories,
      action: '/admin/gallery/images'
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/gallery/images',
  authorize(...editorRoles),
  uploadImage.single('image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const image = {
        category_id: Number(req.body.category_id),
        title: cleanString(req.body.title),
        caption: cleanString(req.body.caption),
        image_path: publicUploadPath(req.file),
        alt_text: cleanString(req.body.alt_text),
        uploaded_by: req.session.user.admin_id,
        status: normalizeStatus(req.body.status)
      };

      const errors = requireFields(image, ['title']);
      if (!image.category_id) errors.push('category is required.');
      if (!image.image_path) errors.push('image upload is required.');
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect('/admin/gallery/images/new');
      }

      const result = await query(
        `INSERT INTO gallery_images
          (category_id, title, caption, image_path, alt_text, uploaded_by, status)
         VALUES
          (:category_id, :title, :caption, :image_path, :alt_text, :uploaded_by, :status)`,
        image
      );
      await logActivity(req, 'Uploaded gallery image', 'gallery_images', result.insertId);
      setFlash(req, 'success', 'Gallery image uploaded.');
      return res.redirect('/admin/gallery');
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/gallery/images/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const [image, categories] = await Promise.all([
      getOne(`SELECT * FROM gallery_images WHERE image_id = :id`, { id: req.params.id }),
      query(`SELECT * FROM gallery_categories ORDER BY category_name ASC`)
    ]);
    if (!image) {
      setFlash(req, 'warning', 'Gallery image not found.');
      return res.redirect('/admin/gallery');
    }
    return res.render('admin/gallery/image-form', {
      title: 'Edit Gallery Image',
      image,
      categories,
      action: `/admin/gallery/images/${image.image_id}`
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/gallery/images/:id',
  authorize(...editorRoles),
  uploadImage.single('image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const existing = await getOne(`SELECT * FROM gallery_images WHERE image_id = :id`, { id: req.params.id });
      if (!existing) {
        setFlash(req, 'warning', 'Gallery image not found.');
        return res.redirect('/admin/gallery');
      }

      const uploadedPath = publicUploadPath(req.file);
      const image = {
        id: req.params.id,
        category_id: Number(req.body.category_id),
        title: cleanString(req.body.title),
        caption: cleanString(req.body.caption),
        image_path: uploadedPath || existing.image_path,
        alt_text: cleanString(req.body.alt_text),
        status: normalizeStatus(req.body.status)
      };

      const errors = requireFields(image, ['title']);
      if (!image.category_id) errors.push('category is required.');
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect(`/admin/gallery/images/${image.id}/edit`);
      }

      await query(
        `UPDATE gallery_images
         SET category_id = :category_id,
             title = :title,
             caption = :caption,
             image_path = :image_path,
             alt_text = :alt_text,
             status = :status
         WHERE image_id = :id`,
        image
      );
      if (uploadedPath && existing.image_path !== uploadedPath) removeUploadedFile(existing.image_path);
      await logActivity(req, 'Updated gallery image', 'gallery_images', image.id);
      setFlash(req, 'success', 'Gallery image updated.');
      return res.redirect('/admin/gallery');
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/gallery/images/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    const existing = await getOne(`SELECT * FROM gallery_images WHERE image_id = :id`, { id: req.params.id });
    if (existing) {
      await query(`DELETE FROM gallery_images WHERE image_id = :id`, { id: req.params.id });
      removeUploadedFile(existing.image_path);
      await logActivity(req, 'Deleted gallery image', 'gallery_images', req.params.id);
    }
    setFlash(req, 'success', 'Gallery image deleted.');
    return res.redirect('/admin/gallery');
  } catch (error) {
    return next(error);
  }
});

router.get('/donations', authorize(...editorRoles), async (req, res, next) => {
  try {
    const donations = await query(
      `SELECT * FROM donation_records
       ORDER BY created_at DESC`
    );
    res.render('admin/donations/index', { title: 'Donation Records', donations, helpers });
  } catch (error) {
    next(error);
  }
});

router.post('/donations/:id/status', authorize(...editorRoles), async (req, res, next) => {
  try {
    const status = ['Pending', 'Redirected', 'Paid', 'Cancelled', 'Failed'].includes(req.body.payment_status)
      ? req.body.payment_status
      : 'Pending';
    await query(
      `UPDATE donation_records
       SET payment_status = :status
       WHERE donation_id = :id`,
      { status, id: req.params.id }
    );
    await logActivity(req, `Updated donation status to ${status}`, 'donation_records', req.params.id);
    setFlash(req, 'success', 'Donation status updated.');
    return res.redirect('/admin/donations');
  } catch (error) {
    return next(error);
  }
});

router.get('/events', authorize(...editorRoles), async (req, res, next) => {
  try {
    const [events, participations] = await Promise.all([
      query(
        `SELECT e.*, au.full_name AS creator_name,
          COUNT(ep.participation_id) AS participant_count
         FROM events e
         LEFT JOIN admin_users au ON au.admin_id = e.created_by
         LEFT JOIN event_participations ep ON ep.event_id = e.event_id
         GROUP BY e.event_id
         ORDER BY e.event_date ASC, e.created_at DESC`
      ),
      query(
        `SELECT ep.*, e.title AS event_title
         FROM event_participations ep
         JOIN events e ON e.event_id = ep.event_id
         ORDER BY ep.created_at DESC`
      )
    ]);
    res.render('admin/events/index', { title: 'Events and Participation', events, participations, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/events/new', authorize(...editorRoles), (req, res) => {
  res.render('admin/events/form', {
    title: 'New Event',
    event: {},
    action: '/admin/events',
    helpers
  });
});

router.post(
  '/events',
  authorize(...editorRoles),
  uploadImage.single('image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const event = {
        title: cleanString(req.body.title),
        description: cleanString(req.body.description),
        event_date: cleanString(req.body.event_date)
          ? `${cleanString(req.body.event_date).replace('T', ' ')}:00`
          : null,
        location: cleanString(req.body.location),
        image_path: publicUploadPath(req.file),
        status: normalizeStatus(req.body.status),
        created_by: req.session.user.admin_id
      };

      const errors = requireFields(event, ['title', 'description']);
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect('/admin/events/new');
      }

      const result = await query(
        `INSERT INTO events
          (title, description, event_date, location, image_path, status, created_by)
         VALUES
          (:title, :description, :event_date, :location, :image_path, :status, :created_by)`,
        event
      );
      await logActivity(req, 'Created event', 'events', result.insertId);
      setFlash(req, 'success', 'Event created.');
      return res.redirect('/admin/events');
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/events/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const event = await getOne(`SELECT * FROM events WHERE event_id = :id`, { id: req.params.id });
    if (!event) {
      setFlash(req, 'warning', 'Event not found.');
      return res.redirect('/admin/events');
    }
    return res.render('admin/events/form', {
      title: 'Edit Event',
      event,
      action: `/admin/events/${event.event_id}`,
      helpers
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/events/:id',
  authorize(...editorRoles),
  uploadImage.single('image'),
  optimizeImage,
  async (req, res, next) => {
    try {
      const existing = await getOne(`SELECT * FROM events WHERE event_id = :id`, { id: req.params.id });
      if (!existing) {
        setFlash(req, 'warning', 'Event not found.');
        return res.redirect('/admin/events');
      }

      const uploadedPath = publicUploadPath(req.file);
      const event = {
        id: req.params.id,
        title: cleanString(req.body.title),
        description: cleanString(req.body.description),
        event_date: cleanString(req.body.event_date)
          ? `${cleanString(req.body.event_date).replace('T', ' ')}:00`
          : null,
        location: cleanString(req.body.location),
        image_path: uploadedPath || existing.image_path,
        status: normalizeStatus(req.body.status)
      };

      const errors = requireFields(event, ['title', 'description']);
      if (errors.length) {
        setFlash(req, 'danger', errors.join(' '));
        return res.redirect(`/admin/events/${event.id}/edit`);
      }

      await query(
        `UPDATE events
         SET title = :title,
             description = :description,
             event_date = :event_date,
             location = :location,
             image_path = :image_path,
             status = :status
         WHERE event_id = :id`,
        event
      );
      if (uploadedPath && existing.image_path !== uploadedPath) removeUploadedFile(existing.image_path);
      await logActivity(req, 'Updated event', 'events', event.id);
      setFlash(req, 'success', 'Event updated.');
      return res.redirect('/admin/events');
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/events/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    const existing = await getOne(`SELECT * FROM events WHERE event_id = :id`, { id: req.params.id });
    if (existing) {
      await query(`DELETE FROM events WHERE event_id = :id`, { id: req.params.id });
      removeUploadedFile(existing.image_path);
      await logActivity(req, 'Deleted event', 'events', req.params.id);
    }
    setFlash(req, 'success', 'Event deleted.');
    return res.redirect('/admin/events');
  } catch (error) {
    return next(error);
  }
});

router.post('/events/participations/:id/status', authorize(...editorRoles), async (req, res, next) => {
  try {
    const status = ['Pending', 'Confirmed', 'Declined'].includes(req.body.status) ? req.body.status : 'Pending';
    await query(
      `UPDATE event_participations
       SET status = :status
       WHERE participation_id = :id`,
      { status, id: req.params.id }
    );
    await logActivity(req, `Updated event participation to ${status}`, 'event_participations', req.params.id);
    setFlash(req, 'success', 'Participation status updated.');
    return res.redirect('/admin/events');
  } catch (error) {
    return next(error);
  }
});

router.post('/events/participations/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    await query(`DELETE FROM event_participations WHERE participation_id = :id`, { id: req.params.id });
    await logActivity(req, 'Deleted event participation', 'event_participations', req.params.id);
    setFlash(req, 'success', 'Participation request deleted.');
    return res.redirect('/admin/events');
  } catch (error) {
    return next(error);
  }
});

router.get('/videos', authorize(...editorRoles), async (req, res, next) => {
  try {
    const videos = await query(
      `SELECT sv.*, au.full_name AS creator_name
       FROM site_videos sv
       LEFT JOIN admin_users au ON au.admin_id = sv.created_by
       ORDER BY sv.display_order ASC, sv.created_at DESC`
    );
    res.render('admin/videos/index', { title: 'Website Videos', videos, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/videos/new', authorize(...editorRoles), (req, res) => {
  res.render('admin/videos/form', {
    title: 'New Website Video',
    video: {},
    action: '/admin/videos'
  });
});

router.post('/videos', authorize(...editorRoles), async (req, res, next) => {
  try {
    const video = {
      title: cleanString(req.body.title),
      description: cleanString(req.body.description),
      video_url: cleanString(req.body.video_url),
      embed_url: buildEmbedUrl(req.body.video_url),
      display_order: Number(req.body.display_order || 0),
      status: normalizeStatus(req.body.status),
      created_by: req.session.user.admin_id
    };

    const errors = requireFields(video, ['title', 'video_url']);
    if (!video.embed_url) errors.push('Use a valid YouTube or Vimeo URL.');
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect('/admin/videos/new');
    }

    const result = await query(
      `INSERT INTO site_videos
        (title, description, video_url, embed_url, display_order, status, created_by)
       VALUES
        (:title, :description, :video_url, :embed_url, :display_order, :status, :created_by)`,
      video
    );
    await logActivity(req, 'Created website video', 'site_videos', result.insertId);
    setFlash(req, 'success', 'Website video saved.');
    return res.redirect('/admin/videos');
  } catch (error) {
    return next(error);
  }
});

router.get('/videos/:id/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const video = await getOne(`SELECT * FROM site_videos WHERE video_id = :id`, { id: req.params.id });
    if (!video) {
      setFlash(req, 'warning', 'Video not found.');
      return res.redirect('/admin/videos');
    }
    return res.render('admin/videos/form', {
      title: 'Edit Website Video',
      video,
      action: `/admin/videos/${video.video_id}`
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/videos/:id', authorize(...editorRoles), async (req, res, next) => {
  try {
    const video = {
      id: req.params.id,
      title: cleanString(req.body.title),
      description: cleanString(req.body.description),
      video_url: cleanString(req.body.video_url),
      embed_url: buildEmbedUrl(req.body.video_url),
      display_order: Number(req.body.display_order || 0),
      status: normalizeStatus(req.body.status)
    };

    const errors = requireFields(video, ['title', 'video_url']);
    if (!video.embed_url) errors.push('Use a valid YouTube or Vimeo URL.');
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect(`/admin/videos/${video.id}/edit`);
    }

    await query(
      `UPDATE site_videos
       SET title = :title,
           description = :description,
           video_url = :video_url,
           embed_url = :embed_url,
           display_order = :display_order,
           status = :status
       WHERE video_id = :id`,
      video
    );
    await logActivity(req, 'Updated website video', 'site_videos', video.id);
    setFlash(req, 'success', 'Website video updated.');
    return res.redirect('/admin/videos');
  } catch (error) {
    return next(error);
  }
});

router.post('/videos/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    await query(`DELETE FROM site_videos WHERE video_id = :id`, { id: req.params.id });
    await logActivity(req, 'Deleted website video', 'site_videos', req.params.id);
    setFlash(req, 'success', 'Website video deleted.');
    return res.redirect('/admin/videos');
  } catch (error) {
    return next(error);
  }
});

router.get('/support/edit', authorize(...editorRoles), async (req, res, next) => {
  try {
    const supportInfo = await getOne(
      `SELECT * FROM support_information
       ORDER BY updated_at DESC
       LIMIT 1`
    );
    res.render('admin/support-edit', { title: 'Support Information', supportInfo: supportInfo || {} });
  } catch (error) {
    next(error);
  }
});

router.post('/support', authorize(...editorRoles), async (req, res, next) => {
  try {
    const support = {
      support_id: Number(req.body.support_id || 0),
      title: cleanString(req.body.title),
      content: cleanString(req.body.content),
      bank_details: cleanString(req.body.bank_details),
      in_kind_donations: cleanString(req.body.in_kind_donations),
      contact_person: cleanString(req.body.contact_person),
      contact_number: cleanString(req.body.contact_number),
      foundation_address: cleanString(req.body.foundation_address),
      foundation_email: cleanString(req.body.foundation_email),
      facebook_url: cleanString(req.body.facebook_url),
      youtube_url: cleanString(req.body.youtube_url),
      google_maps_query: cleanString(req.body.google_maps_query),
      updated_by: req.session.user.admin_id
    };
    const errors = requireFields(support, ['title', 'content']);
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect('/admin/support/edit');
    }

    if (support.support_id) {
      await query(
        `UPDATE support_information
         SET title = :title,
             content = :content,
             bank_details = :bank_details,
             in_kind_donations = :in_kind_donations,
             contact_person = :contact_person,
             contact_number = :contact_number,
             foundation_address = :foundation_address,
             foundation_email = :foundation_email,
             facebook_url = :facebook_url,
             youtube_url = :youtube_url,
             google_maps_query = :google_maps_query,
             updated_by = :updated_by
         WHERE support_id = :support_id`,
        support
      );
      await logActivity(req, 'Updated support information', 'support_information', support.support_id);
    } else {
      const result = await query(
        `INSERT INTO support_information
          (title, content, bank_details, in_kind_donations, contact_person, contact_number, foundation_address, foundation_email, facebook_url, youtube_url, google_maps_query, updated_by)
         VALUES
          (:title, :content, :bank_details, :in_kind_donations, :contact_person, :contact_number, :foundation_address, :foundation_email, :facebook_url, :youtube_url, :google_maps_query, :updated_by)`,
        support
      );
      await logActivity(req, 'Created support information', 'support_information', result.insertId);
    }

    setFlash(req, 'success', 'Support information saved.');
    return res.redirect('/admin/support/edit');
  } catch (error) {
    return next(error);
  }
});

router.get('/messages', authorize(...allRoles), async (req, res, next) => {
  try {
    const status = ['Read', 'Unread'].includes(req.query.status) ? req.query.status : null;
    const messages = await query(
      `SELECT * FROM contact_messages
       ${status ? 'WHERE status = :status' : ''}
       ORDER BY created_at DESC`,
      status ? { status } : {}
    );
    res.render('admin/messages/index', { title: 'Contact Messages', messages, status, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/messages/:id', authorize(...allRoles), async (req, res, next) => {
  try {
    const message = await getOne(`SELECT * FROM contact_messages WHERE message_id = :id`, { id: req.params.id });
    if (!message) {
      setFlash(req, 'warning', 'Message not found.');
      return res.redirect('/admin/messages');
    }
    return res.render('admin/messages/show', { title: message.subject, message, helpers });
  } catch (error) {
    return next(error);
  }
});

router.post('/messages/:id/toggle', authorize(...editorRoles), async (req, res, next) => {
  try {
    const nextStatus = req.body.status === 'Read' ? 'Read' : 'Unread';
    await query(
      `UPDATE contact_messages SET status = :status WHERE message_id = :id`,
      { status: nextStatus, id: req.params.id }
    );
    await logActivity(req, `Marked message as ${nextStatus}`, 'contact_messages', req.params.id);
    setFlash(req, 'success', 'Message status updated.');
    return res.redirect(`/admin/messages/${req.params.id}`);
  } catch (error) {
    return next(error);
  }
});

router.post('/messages/:id/delete', authorize(...editorRoles), async (req, res, next) => {
  try {
    await query(`DELETE FROM contact_messages WHERE message_id = :id`, { id: req.params.id });
    await logActivity(req, 'Deleted contact message', 'contact_messages', req.params.id);
    setFlash(req, 'success', 'Message deleted.');
    return res.redirect('/admin/messages');
  } catch (error) {
    return next(error);
  }
});

router.get('/users', authorize('Super Admin'), async (req, res, next) => {
  try {
    const users = await query(`SELECT * FROM admin_users ORDER BY created_at DESC`);
    res.render('admin/users/index', { title: 'Admin Users', users, helpers });
  } catch (error) {
    next(error);
  }
});

router.get('/users/new', authorize('Super Admin'), (req, res) => {
  res.render('admin/users/form', {
    title: 'New Admin User',
    user: {},
    action: '/admin/users'
  });
});

router.post('/users', authorize('Super Admin'), async (req, res, next) => {
  try {
    const user = {
      full_name: cleanString(req.body.full_name),
      email: cleanString(req.body.email).toLowerCase(),
      password_hash: await hashPassword(String(req.body.password || '')),
      role: ['Super Admin', 'Content Editor', 'Viewer'].includes(req.body.role) ? req.body.role : 'Viewer',
      status: ['Active', 'Inactive'].includes(req.body.status) ? req.body.status : 'Active'
    };
    const errors = requireFields({ ...user, password: req.body.password }, ['full_name', 'email', 'password']);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) errors.push('valid email is required.');
    if (String(req.body.password || '').length < 6) errors.push('password must be at least 6 characters.');
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect('/admin/users/new');
    }

    const result = await query(
      `INSERT INTO admin_users
        (full_name, email, password_hash, role, status)
       VALUES
        (:full_name, :email, :password_hash, :role, :status)`,
      user
    );
    await logActivity(req, 'Created admin user', 'admin_users', result.insertId);
    setFlash(req, 'success', 'Admin user created.');
    return res.redirect('/admin/users');
  } catch (error) {
    return next(error);
  }
});

router.get('/users/:id/edit', authorize('Super Admin'), async (req, res, next) => {
  try {
    const user = await getOne(`SELECT * FROM admin_users WHERE admin_id = :id`, { id: req.params.id });
    if (!user) {
      setFlash(req, 'warning', 'Admin user not found.');
      return res.redirect('/admin/users');
    }
    return res.render('admin/users/form', {
      title: 'Edit Admin User',
      user,
      action: `/admin/users/${user.admin_id}`
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/users/:id', authorize('Super Admin'), async (req, res, next) => {
  try {
    const password = String(req.body.password || '');
    const user = {
      id: req.params.id,
      full_name: cleanString(req.body.full_name),
      email: cleanString(req.body.email).toLowerCase(),
      role: ['Super Admin', 'Content Editor', 'Viewer'].includes(req.body.role) ? req.body.role : 'Viewer',
      status: ['Active', 'Inactive'].includes(req.body.status) ? req.body.status : 'Active'
    };
    const errors = requireFields(user, ['full_name', 'email']);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) errors.push('valid email is required.');
    if (password && password.length < 6) errors.push('new password must be at least 6 characters.');
    if (errors.length) {
      setFlash(req, 'danger', errors.join(' '));
      return res.redirect(`/admin/users/${user.id}/edit`);
    }

    if (password) {
      user.password_hash = await hashPassword(password);
      await query(
        `UPDATE admin_users
         SET full_name = :full_name,
             email = :email,
             password_hash = :password_hash,
             role = :role,
             status = :status
         WHERE admin_id = :id`,
        user
      );
    } else {
      await query(
        `UPDATE admin_users
         SET full_name = :full_name,
             email = :email,
             role = :role,
             status = :status
         WHERE admin_id = :id`,
        user
      );
    }

    await logActivity(req, 'Updated admin user', 'admin_users', user.id);
    setFlash(req, 'success', 'Admin user updated.');
    return res.redirect('/admin/users');
  } catch (error) {
    return next(error);
  }
});

router.post('/users/:id/deactivate', authorize('Super Admin'), async (req, res, next) => {
  try {
    await query(
      `UPDATE admin_users SET status = 'Inactive' WHERE admin_id = :id`,
      { id: req.params.id }
    );
    await logActivity(req, 'Deactivated admin user', 'admin_users', req.params.id);
    setFlash(req, 'success', 'Admin user deactivated.');
    return res.redirect('/admin/users');
  } catch (error) {
    return next(error);
  }
});

router.get('/activity', authorize(...editorRoles), async (req, res, next) => {
  try {
    const logs = await query(
      `SELECT al.*, au.full_name
       FROM activity_logs al
       LEFT JOIN admin_users au ON au.admin_id = al.admin_id
       ORDER BY al.created_at DESC
       LIMIT 200`
    );
    res.render('admin/activity/index', { title: 'Activity Logs', logs, helpers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
