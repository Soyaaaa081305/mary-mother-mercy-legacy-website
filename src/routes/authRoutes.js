const express = require('express');
const { getOne } = require('../config/db');
const { requireGuest, requireAuth } = require('../middleware/auth');
const { cleanString, setFlash } = require('../middleware/validators');
const { verifyPassword } = require('../utils/password');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

router.get('/login', requireGuest, (req, res) => {
  res.render('admin/auth/login', {
    title: 'Admin Login',
    form: {}
  });
});

router.post('/login', requireGuest, async (req, res, next) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    const password = String(req.body.password || '');

    const user = await getOne(
      `SELECT * FROM admin_users
       WHERE email = :email AND status = 'Active'
       LIMIT 1`,
      { email }
    );

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).render('admin/auth/login', {
        title: 'Admin Login',
        form: { email },
        error: 'Invalid email or password.'
      });
    }

    req.session.user = {
      admin_id: user.admin_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    await logActivity(req, 'Logged in', 'admin_users', user.admin_id);
    setFlash(req, 'success', `Welcome back, ${user.full_name}.`);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await logActivity(req, 'Logged out', 'admin_users', req.session.user.admin_id);
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

