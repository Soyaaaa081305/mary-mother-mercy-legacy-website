function cleanString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeStatus(value, allowed = ['Draft', 'Published']) {
  return allowed.includes(value) ? value : allowed[0];
}

function requireFields(body, fields) {
  const errors = [];
  for (const field of fields) {
    if (!cleanString(body[field])) {
      errors.push(`${field.replace(/_/g, ' ')} is required.`);
    }
  }
  return errors;
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

module.exports = {
  cleanString,
  normalizeStatus,
  requireFields,
  setFlash
};

