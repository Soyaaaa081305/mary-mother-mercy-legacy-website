const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set(['/webhooks/paymongo']);

function csrfProtection(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  if (SAFE_METHODS.has(req.method) || EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  if (req.body?._csrf === req.session.csrfToken) {
    return next();
  }

  if (req.path.startsWith('/admin')) {
    req.session.flash = {
      type: 'danger',
      message: 'Security token expired. Please submit the form again.'
    };
    return res.redirect(req.get('referer') || '/admin/dashboard');
  }

  return res.status(403).render('public/error', {
    title: 'Security Check Failed',
    message: 'Security token expired. Please reload the page and submit the form again.'
  });
}

module.exports = {
  csrfProtection
};

