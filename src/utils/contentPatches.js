async function applyContentPatches(pool) {
  const connection = await pool.getConnection();

  try {
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
