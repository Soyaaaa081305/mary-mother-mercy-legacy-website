const express = require('express');
const { getOne } = require('../config/db');
const { requireGuest, requireAuth } = require('../middleware/auth');
const { cleanString, setFlash } = require('../middleware/validators');
const { verifyPassword } = require('../utils/password');
const { logActivity } = require('../utils/activityLogger');
const {
  createAdminOtp,
  createTrustedDevice,
  getTrustedDeviceHours,
  maskEmail,
  otpEnabled,
  sendAdminOtpEmail,
  verifyAdminOtp,
  verifyTrustedDevice
} = require('../utils/adminOtp');

const router = express.Router();

router.get('/login', requireGuest, (req, res) => {
  delete req.session.pendingAdminOtp;
  res.render('admin/auth/login', {
    title: 'Admin Login',
    form: {}
  });
});

function setLoggedInUser(req, user) {
  req.session.user = {
    admin_id: user.admin_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  };
}

function serializeOtpExpiry(expiresAt) {
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return Number.isNaN(date.getTime()) ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : date.toISOString();
}

async function startOtpLogin(req, res, user, formEmail) {
  try {
    const otp = await createAdminOtp(user.admin_id);
    const delivery = await sendAdminOtpEmail(user, otp.code, otp.expiresAt);

    req.session.pendingAdminOtp = {
      otpId: otp.otpId,
      adminId: user.admin_id,
      email: user.email,
      fullName: user.full_name,
      maskedRecipient: delivery.maskedRecipient,
      expiresAt: serializeOtpExpiry(otp.expiresAt)
    };

    await logActivity(req, 'Requested admin login OTP', 'admin_users', user.admin_id);
    setFlash(req, 'success', `Login code sent to ${delivery.maskedRecipient}.`);
    return res.redirect('/admin/verify-otp');
  } catch (error) {
    return res.status(500).render('admin/auth/login', {
      title: 'Admin Login',
      form: { email: formEmail },
      error: `OTP email could not be sent: ${error.message}`
    });
  }
}

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

    if (otpEnabled()) {
      if (await verifyTrustedDevice(req, res, user.admin_id)) {
        setLoggedInUser(req, user);
        await logActivity(req, 'Logged in with trusted OTP device', 'admin_users', user.admin_id);
        setFlash(req, 'success', `Welcome back, ${user.full_name}.`);
        return res.redirect('/admin/dashboard');
      }
      return startOtpLogin(req, res, user, email);
    }

    setLoggedInUser(req, user);
    await logActivity(req, 'Logged in', 'admin_users', user.admin_id);
    setFlash(req, 'success', `Welcome back, ${user.full_name}.`);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    return next(error);
  }
});

router.get('/verify-otp', requireGuest, (req, res) => {
  const pending = req.session.pendingAdminOtp;
  if (!pending) {
    setFlash(req, 'warning', 'Please enter your admin email and password first.');
    return res.redirect('/admin/login');
  }

  return res.render('admin/auth/verify-otp', {
    title: 'Verify Login Code',
    form: {},
    pending,
    trustHours: getTrustedDeviceHours()
  });
});

router.post('/verify-otp', requireGuest, async (req, res, next) => {
  try {
    const pending = req.session.pendingAdminOtp;
    if (!pending) {
      setFlash(req, 'warning', 'Please enter your admin email and password first.');
      return res.redirect('/admin/login');
    }

    const code = cleanString(req.body.otp_code).replace(/\D/g, '');
    const result = await verifyAdminOtp({
      otpId: pending.otpId,
      adminId: pending.adminId,
      code
    });

    if (!result.ok) {
      return res.status(401).render('admin/auth/verify-otp', {
        title: 'Verify Login Code',
        form: { otp_code: code },
        pending,
        trustHours: getTrustedDeviceHours(),
        error: result.message
      });
    }

    const user = await getOne(
      `SELECT * FROM admin_users
       WHERE admin_id = :adminId AND status = 'Active'
       LIMIT 1`,
      { adminId: pending.adminId }
    );

    if (!user) {
      delete req.session.pendingAdminOtp;
      setFlash(req, 'danger', 'Admin account is no longer active.');
      return res.redirect('/admin/login');
    }

    delete req.session.pendingAdminOtp;
    setLoggedInUser(req, user);
    if (req.body.trust_device === 'on') {
      await createTrustedDevice(req, res, user.admin_id);
      await logActivity(req, 'Trusted admin OTP device', 'admin_users', user.admin_id);
    }
    await logActivity(req, 'Logged in with OTP', 'admin_users', user.admin_id);
    setFlash(req, 'success', `Welcome back, ${user.full_name}.`);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    return next(error);
  }
});

router.post('/resend-otp', requireGuest, async (req, res, next) => {
  try {
    const pending = req.session.pendingAdminOtp;
    if (!pending) {
      setFlash(req, 'warning', 'Please enter your admin email and password first.');
      return res.redirect('/admin/login');
    }

    const user = await getOne(
      `SELECT * FROM admin_users
       WHERE admin_id = :adminId AND status = 'Active'
       LIMIT 1`,
      { adminId: pending.adminId }
    );

    if (!user) {
      delete req.session.pendingAdminOtp;
      setFlash(req, 'danger', 'Admin account is no longer active.');
      return res.redirect('/admin/login');
    }

    const otp = await createAdminOtp(user.admin_id);
    const delivery = await sendAdminOtpEmail(user, otp.code, otp.expiresAt);
    req.session.pendingAdminOtp = {
      otpId: otp.otpId,
      adminId: user.admin_id,
      email: user.email,
      fullName: user.full_name,
      maskedRecipient: delivery.maskedRecipient,
      expiresAt: serializeOtpExpiry(otp.expiresAt)
    };

    await logActivity(req, 'Resent admin login OTP', 'admin_users', user.admin_id);
    setFlash(req, 'success', `New login code sent to ${delivery.maskedRecipient}.`);
    return res.redirect('/admin/verify-otp');
  } catch (error) {
    const pending = req.session.pendingAdminOtp || {};
    return res.status(500).render('admin/auth/verify-otp', {
      title: 'Verify Login Code',
      form: {},
      pending: {
        ...pending,
        maskedRecipient: pending.maskedRecipient || maskEmail(pending.email)
      },
      trustHours: getTrustedDeviceHours(),
      error: `OTP email could not be resent: ${error.message}`
    });
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
