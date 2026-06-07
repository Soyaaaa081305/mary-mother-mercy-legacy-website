const { query } = require('../config/db');

async function logActivity(req, action, tableAffected, recordId = null) {
  const adminId = req.session.user ? req.session.user.admin_id : null;
  await query(
    `INSERT INTO activity_logs (admin_id, action, table_affected, record_id)
     VALUES (:adminId, :action, :tableAffected, :recordId)`,
    { adminId, action, tableAffected, recordId }
  );
}

module.exports = {
  logActivity
};

