async function applyContentPatches(pool) {
  const connection = await pool.getConnection();

  try {
    const adminPasswordHash = 'scrypt$16384$8$1$25d407bc6dd47ed6e5f2afa156beb610$08e654fb5948978d61f2a3b797e593ea0802ba45979b45b026cf411a7caab33320d8897ae12206e0ae8adf242eb62ffaae5361066256c9be2b85e19719319d91';
    await connection.query(
      `INSERT INTO admin_users
         (full_name, email, password_hash, role, status)
       VALUES
         ('System Administrator', 'admin@marymother.local', ?, 'Super Admin', 'Active')
       ON DUPLICATE KEY UPDATE email = email`,
      [adminPasswordHash]
    );

    const [adminResult] = await connection.query(
      `UPDATE admin_users
       SET full_name = 'System Administrator',
           password_hash = ?,
           role = 'Super Admin',
           status = 'Active'
       WHERE email = 'admin@marymother.local'`,
      [adminPasswordHash]
    );

    await connection.query(
      `DELETE FROM admin_users
       WHERE email <> 'admin@marymother.local'`
    );

    if (adminResult.affectedRows) {
      console.log('Applied content patch: updated the single admin account.');
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
