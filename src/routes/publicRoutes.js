const express = require('express');
const { query, getOne } = require('../config/db');
const { cleanString, setFlash } = require('../middleware/validators');
const { formatDate, formatDateTime, excerpt, nl2br } = require('../utils/formatters');
const { createDonationCheckout, verifyPaymongoWebhook } = require('../utils/paymongo');

const router = express.Router();

const renderHelpers = {
  formatDate,
  formatDateTime,
  excerpt,
  nl2br
};

async function getPublishedPage(slug) {
  return getOne(
    `SELECT * FROM pages
     WHERE page_slug = :slug AND status = 'Published'
     LIMIT 1`,
    { slug }
  );
}

router.get('/', async (req, res, next) => {
  try {
    const [homePage, legacyEntries, featuredStory, galleryImages, events, videos, supportInfo] = await Promise.all([
      getPublishedPage('home'),
      query(
        `SELECT * FROM legacy_entries
         WHERE status = 'Published'
         ORDER BY display_order ASC, milestone_date ASC
         LIMIT 3`
      ),
      getOne(
        `SELECT * FROM caregiver_stories
         WHERE status = 'Published'
         ORDER BY published_at DESC, created_at DESC
         LIMIT 1`
      ),
      query(
        `SELECT gi.*, gc.category_name
         FROM gallery_images gi
         JOIN gallery_categories gc ON gc.category_id = gi.category_id
         WHERE gi.status = 'Published'
         ORDER BY gi.created_at DESC
         LIMIT 6`
      ),
      query(
        `SELECT * FROM events
         WHERE status = 'Published'
         ORDER BY event_date ASC, created_at DESC
         LIMIT 2`
      ),
      query(
        `SELECT * FROM site_videos
         WHERE status = 'Published'
         ORDER BY display_order ASC, created_at DESC
         LIMIT 1`
      ),
      getOne(
        `SELECT * FROM support_information
         ORDER BY updated_at DESC
         LIMIT 1`
      )
    ]);

    res.render('public/home', {
      title: 'Home',
      homePage,
      legacyEntries,
      featuredStory,
      galleryImages,
      events,
      videos,
      supportInfo,
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/about', async (req, res, next) => {
  try {
    const page = await getPublishedPage('about');
    res.render('public/page', {
      title: 'About',
      page,
      eyebrow: 'About the Foundation',
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/legacy', async (req, res, next) => {
  try {
    const [page, entries] = await Promise.all([
      getPublishedPage('legacy'),
      query(
        `SELECT * FROM legacy_entries
         WHERE status = 'Published'
         ORDER BY display_order ASC, milestone_date ASC, created_at DESC`
      )
    ]);

    res.render('public/legacy', {
      title: 'Legacy',
      page,
      entries,
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/legacy/:id', async (req, res, next) => {
  try {
    const entry = await getOne(
      `SELECT * FROM legacy_entries
       WHERE legacy_id = :id AND status = 'Published'
       LIMIT 1`,
      { id: req.params.id }
    );

    if (!entry) return res.status(404).render('public/404', { title: 'Legacy Entry Not Found' });

    return res.render('public/legacy-detail', {
      title: entry.title,
      entry,
      helpers: renderHelpers
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/caregiver-stories', async (req, res, next) => {
  try {
    const stories = await query(
      `SELECT * FROM caregiver_stories
       WHERE status = 'Published'
       ORDER BY published_at DESC, created_at DESC`
    );

    res.render('public/stories', {
      title: 'Caregiver Stories',
      stories,
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/caregiver-stories/:id', async (req, res, next) => {
  try {
    const story = await getOne(
      `SELECT * FROM caregiver_stories
       WHERE story_id = :id AND status = 'Published'
       LIMIT 1`,
      { id: req.params.id }
    );

    if (!story) return res.status(404).render('public/404', { title: 'Story Not Found' });

    return res.render('public/story-detail', {
      title: story.title,
      story,
      helpers: renderHelpers
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/gallery', async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT gc.*, COUNT(gi.image_id) AS image_count
       FROM gallery_categories gc
       LEFT JOIN gallery_images gi
        ON gi.category_id = gc.category_id
        AND gi.status = 'Published'
       GROUP BY gc.category_id
       ORDER BY gc.category_name ASC`
    );

    const images = await query(
      `SELECT gi.*, gc.category_name
       FROM gallery_images gi
       JOIN gallery_categories gc ON gc.category_id = gi.category_id
       WHERE gi.status = 'Published'
       ORDER BY gc.category_name ASC, gi.created_at DESC`
    );

    res.render('public/gallery', {
      title: 'Gallery',
      categories,
      images
    });
  } catch (error) {
    next(error);
  }
});

router.get('/support', async (req, res, next) => {
  try {
    const [page, supportInfo] = await Promise.all([
      getPublishedPage('support'),
      getOne(
        `SELECT * FROM support_information
         ORDER BY updated_at DESC
         LIMIT 1`
      )
    ]);

    res.render('public/support', {
      title: 'Support',
      page,
      supportInfo,
      donationForm: {},
      donationErrors: [],
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.post('/donate', async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const donation = {
      donor_name: cleanString(req.body.donor_name),
      donor_email: cleanString(req.body.donor_email),
      donor_phone: cleanString(req.body.donor_phone),
      amount,
      message: cleanString(req.body.message),
      reference_number: `DON-${Date.now()}-${Math.round(Math.random() * 1e6)}`
    };

    const donationErrors = [];
    if (!donation.donor_name) donationErrors.push('Donor name is required.');
    if (!donation.donor_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donation.donor_email)) donationErrors.push('A valid donor email is required.');
    if (!Number.isFinite(amount) || amount < 20) donationErrors.push('Donation amount must be at least PHP 20.');

    if (donationErrors.length) {
      const [page, supportInfo] = await Promise.all([
        getPublishedPage('support'),
        getOne(
          `SELECT * FROM support_information
           ORDER BY updated_at DESC
           LIMIT 1`
        )
      ]);
      return res.status(422).render('public/support', {
        title: 'Support',
        page,
        supportInfo,
        donationForm: req.body,
        donationErrors,
        helpers: renderHelpers
      });
    }

    await query(
      `INSERT INTO donation_records
        (donor_name, donor_email, donor_phone, amount, message, reference_number, payment_status)
       VALUES
        (:donor_name, :donor_email, :donor_phone, :amount, :message, :reference_number, 'Pending')`,
      donation
    );

    const checkout = await createDonationCheckout(req, donation);
    await query(
      `UPDATE donation_records
       SET paymongo_checkout_session_id = :checkoutSessionId,
           paymongo_checkout_url = :checkoutUrl,
           payment_status = 'Redirected'
       WHERE reference_number = :reference`,
      {
        checkoutSessionId: checkout.checkoutSessionId,
        checkoutUrl: checkout.checkoutUrl,
        reference: donation.reference_number
      }
    );

    return res.redirect(303, checkout.checkoutUrl);
  } catch (error) {
    req.session.flash = {
      type: 'danger',
      message: `Donation checkout could not start: ${error.message}`
    };
    return res.redirect('/support');
  }
});

router.get('/donation/success', async (req, res, next) => {
  try {
    const reference = cleanString(req.query.ref);
    if (reference) {
      await query(
        `UPDATE donation_records
         SET payment_status = CASE
           WHEN payment_status = 'Paid' THEN 'Paid'
           ELSE 'Redirected'
         END
         WHERE reference_number = :reference`,
        { reference }
      );
    }

    res.render('public/payment-result', {
      title: 'Donation Submitted',
      heading: 'Thank you for supporting the foundation',
      message: 'Your PayMongo checkout was completed or returned successfully. Final paid status should be confirmed by the PayMongo dashboard or webhook.',
      reference
    });
  } catch (error) {
    next(error);
  }
});

router.get('/donation/cancel', async (req, res, next) => {
  try {
    const reference = cleanString(req.query.ref);
    if (reference) {
      await query(
        `UPDATE donation_records
         SET payment_status = 'Cancelled'
         WHERE reference_number = :reference AND payment_status <> 'Paid'`,
        { reference }
      );
    }

    res.render('public/payment-result', {
      title: 'Donation Cancelled',
      heading: 'Donation checkout cancelled',
      message: 'No donation payment was completed. You may return to the support page and try again anytime.',
      reference
    });
  } catch (error) {
    next(error);
  }
});

router.post('/webhooks/paymongo', async (req, res, next) => {
  try {
    if (!verifyPaymongoWebhook(req)) {
      return res.status(400).json({ received: false, error: 'Invalid PayMongo webhook signature.' });
    }

    const event = req.body?.data;
    const eventType = event?.attributes?.type;
    const payload = event?.attributes?.data;
    const resource = payload?.attributes ? payload : payload?.data;
    const attrs = resource?.attributes || {};
    const checkoutSessionId = resource?.id || attrs.checkout_session_id || attrs.checkout_session?.id;
    const referenceNumber = attrs.reference_number || attrs.metadata?.reference_number;

    if (eventType === 'checkout_session.payment.paid') {
      if (checkoutSessionId) {
        await query(
          `UPDATE donation_records
           SET payment_status = 'Paid'
           WHERE paymongo_checkout_session_id = :checkoutSessionId`,
          { checkoutSessionId }
        );
      }
      if (referenceNumber) {
        await query(
          `UPDATE donation_records
           SET payment_status = 'Paid'
           WHERE reference_number = :referenceNumber`,
          { referenceNumber }
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

router.get('/events', async (req, res, next) => {
  try {
    const events = await query(
      `SELECT * FROM events
       WHERE status = 'Published'
       ORDER BY event_date ASC, created_at DESC`
    );

    res.render('public/events', {
      title: 'Events',
      events,
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/events/:id', async (req, res, next) => {
  try {
    const event = await getOne(
      `SELECT * FROM events
       WHERE event_id = :id AND status = 'Published'
       LIMIT 1`,
      { id: req.params.id }
    );

    if (!event) return res.status(404).render('public/404', { title: 'Event Not Found' });

    return res.render('public/event-detail', {
      title: event.title,
      event,
      form: {},
      errors: [],
      helpers: renderHelpers
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/events/:id/participate', async (req, res, next) => {
  try {
    const event = await getOne(
      `SELECT * FROM events
       WHERE event_id = :id AND status = 'Published'
       LIMIT 1`,
      { id: req.params.id }
    );

    if (!event) return res.status(404).render('public/404', { title: 'Event Not Found' });

    const form = {
      event_id: event.event_id,
      full_name: cleanString(req.body.full_name),
      email: cleanString(req.body.email),
      phone_number: cleanString(req.body.phone_number),
      organization: cleanString(req.body.organization),
      message: cleanString(req.body.message)
    };

    const errors = [];
    if (!form.full_name) errors.push('Full name is required.');
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push('A valid email address is required.');

    if (errors.length) {
      return res.status(422).render('public/event-detail', {
        title: event.title,
        event,
        form,
        errors,
        helpers: renderHelpers
      });
    }

    await query(
      `INSERT INTO event_participations
        (event_id, full_name, email, phone_number, organization, message, status)
       VALUES
        (:event_id, :full_name, :email, :phone_number, :organization, :message, 'Pending')`,
      form
    );

    setFlash(req, 'success', 'Your event participation request was submitted. Staff will review it soon.');
    return res.redirect(`/events/${event.event_id}`);
  } catch (error) {
    return next(error);
  }
});

router.get('/videos', async (req, res, next) => {
  try {
    const videos = await query(
      `SELECT * FROM site_videos
       WHERE status = 'Published'
       ORDER BY display_order ASC, created_at DESC`
    );

    res.render('public/videos', {
      title: 'Videos',
      videos,
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/contact', async (req, res, next) => {
  try {
    const page = await getPublishedPage('contact');
    res.render('public/contact', {
      title: 'Contact',
      page,
      form: {},
      errors: [],
      helpers: renderHelpers
    });
  } catch (error) {
    next(error);
  }
});

router.post('/contact', async (req, res, next) => {
  try {
    const form = {
      full_name: cleanString(req.body.full_name),
      email: cleanString(req.body.email),
      phone_number: cleanString(req.body.phone_number),
      subject: cleanString(req.body.subject),
      message: cleanString(req.body.message)
    };

    const errors = [];
    if (!form.full_name) errors.push('Full name is required.');
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push('A valid email address is required.');
    if (!form.subject) errors.push('Subject is required.');
    if (!form.message) errors.push('Message is required.');

    if (errors.length) {
      const page = await getPublishedPage('contact');
      return res.status(422).render('public/contact', {
        title: 'Contact',
        page,
        form,
        errors,
        helpers: renderHelpers
      });
    }

    await query(
      `INSERT INTO contact_messages
        (full_name, email, phone_number, subject, message, status)
       VALUES
        (:full_name, :email, :phone_number, :subject, :message, 'Unread')`,
      form
    );

    setFlash(req, 'success', 'Your message was sent successfully. Thank you for reaching out.');
    return res.redirect('/contact');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
