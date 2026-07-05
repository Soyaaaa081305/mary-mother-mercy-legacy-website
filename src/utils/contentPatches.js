async function applyContentPatches(pool) {
  const connection = await pool.getConnection();

  try {
    const [adminResult] = await connection.query(
      `UPDATE admin_users
       SET full_name = 'System Administrator',
           role = 'Super Admin',
           status = 'Active'
       WHERE email = 'admin@marymother.local'`
    );

    await connection.query(
      `DELETE FROM admin_users
       WHERE email <> 'admin@marymother.local'`
    );

    if (adminResult.affectedRows) {
      console.log('Applied content patch: enforced the single admin account.');
    }

    const [aboutPageResult] = await connection.query(
      `UPDATE pages
       SET page_name = 'About & Contact Page',
           hero_eyebrow = CASE
             WHEN hero_eyebrow IN ('About the foundation', 'About the Foundation') THEN 'About and official contacts'
             ELSE hero_eyebrow
           END,
           title = CASE
             WHEN title IN ('A Haven of Love, Prayer, and Daily Care', 'About the Foundation', 'About and Contact Mary Mother of Mercy Home') THEN 'About & Contact'
             ELSE title
           END,
           hero_summary = CASE
             WHEN hero_summary IN (
               'Learn about the home, the sisters and staff who serve, and the values that guide its care for abandoned elderly women.',
               'Learn about the foundation background, mission, vision, values, and service approach.'
             ) THEN 'Learn about the home, the sisters and staff who serve, and the official channels for visits, donations, volunteer coordination, and messages.'
             ELSE hero_summary
           END
       WHERE page_slug = 'about'`
    );

    const [contactPageResult] = await connection.query(
      `UPDATE pages
       SET page_name = 'Contact Page (merged into About & Contact)',
           status = 'Draft'
       WHERE page_slug = 'contact'`
    );

    if (aboutPageResult.affectedRows || contactPageResult.affectedRows) {
      console.log('Applied content patch: merged About and Contact public pages.');
    }

    const [result] = await connection.query(
      `UPDATE gallery_images
       SET title = 'Courtyard View',
           caption = 'A wider view of the chapel frontage, courtyard, and home exterior.',
           image_path = '/images/mary-mother/about-facility.jpg',
           alt_text = 'Wide courtyard view of the chapel frontage and home exterior',
           category_id = (
             SELECT category_id
             FROM gallery_categories
             WHERE category_name = 'Home and Facilities'
             LIMIT 1
           )
       WHERE title = 'Garden View'
         AND image_path = '/images/mary-mother/garden-wide.jpg'`
    );

    if (result.affectedRows) {
      console.log(`Applied content patch: replaced duplicate Garden View image (${result.affectedRows} row).`);
    }
  } catch (error) {
    if (error.code !== 'ER_NO_SUCH_TABLE') {
      throw error;
    }
  } finally {
    connection.release();
  }
}

module.exports = {
  applyContentPatches
};
