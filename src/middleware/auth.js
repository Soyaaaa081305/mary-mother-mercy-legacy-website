function requireAuth(req, res, next) {
  if (req.session.user) return next();
  req.session.flash = { type: 'warning', message: 'Please log in to access the admin dashboard.' };
  return res.redirect('/admin/login');
}

function requireGuest(req, res, next) {
  if (!req.session.user) return next();
  return res.redirect('/admin/dashboard');
}

function authorize(...roles) {
  return (req, res, next) => {
    const user = req.session.user;
    if (user && roles.includes(user.role)) return next();
    req.session.flash = { type: 'danger', message: 'Your account does not have permission to perform that action.' };
    return res.redirect('/admin/dashboard');
  };
}

module.exports = {
  requireAuth,
  requireGuest,
  authorize
};

