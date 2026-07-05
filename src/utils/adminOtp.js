const crypto = require('crypto');
const { query, getOne } = require('../config/db');

const OTP_KEY_LENGTH = 32;
const TRUSTED_DEVICE_COOKIE = 'mary_mother_trusted_otp';

function otpEnabled() {
  return ['1', 'true', 'yes', 'on'].includes(String(process.env.ADMIN_OTP_ENABLED || '').toLowerCase());
}

function getOtpExpiryMinutes() {
  const minutes = Number(process.env.ADMIN_OTP_EXPIRES_MINUTES || 10);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
}

function getOtpMaxAttempts() {
  const attempts = Number(process.env.ADMIN_OTP_MAX_ATTEMPTS || 5);
  return Number.isFinite(attempts) && attempts > 0 ? attempts : 5;
}

function getTrustedDeviceHours() {
  const hours = Number(process.env.ADMIN_OTP_TRUST_HOURS || 12);
  return Number.isFinite(hours) && hours > 0 ? Math.min(Math.round(hours), 168) : 12;
}

function generateOtpCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
}

function hashTrustedDeviceToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function parseCookieHeader(headerValue) {
  return String(headerValue || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return cookies;
      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value || '');
      return cookies;
    }, {});
}

function setTrustedDeviceCookie(res, value, maxAgeSeconds) {
  const attributes = [
    `${TRUSTED_DEVICE_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/admin',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`
  ];

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }

  res.append('Set-Cookie', attributes.join('; '));
}

function clearTrustedDeviceCookie(res) {
  setTrustedDeviceCookie(res, '', 0);
}

function hashOtp(code, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(String(code), salt, OTP_KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString('hex'));
    });
  });
}

function maskEmail(email) {
  const value = String(email || '');
  const [name, domain] = value.split('@');
  if (!name || !domain) return value || 'configured email';
  const visible = name.length <= 2 ? name[0] : `${name[0]}${name[name.length - 1]}`;
  return `${visible.padEnd(Math.min(name.length, 4), '*')}@${domain}`;
}

function getOtpRecipient(user) {
  return process.env.ADMIN_OTP_TEST_RECIPIENT || user.email;
}

async function createTrustedDevice(req, res, adminId) {
  const token = crypto.randomBytes(32).toString('hex');
  const trustedValue = `${adminId}.${token}`;
  const tokenHash = hashTrustedDeviceToken(token);
  const trustHours = getTrustedDeviceHours();
  const userAgent = String(req.get('user-agent') || '').slice(0, 255);

  await query(
    `DELETE FROM admin_otp_trusted_devices
     WHERE admin_id = :adminId
       AND (expires_at <= NOW() OR revoked_at IS NOT NULL)`,
    { adminId }
  );

  await query(
    `INSERT INTO admin_otp_trusted_devices
      (admin_id, token_hash, user_agent, expires_at)
     VALUES
      (:adminId, :tokenHash, :userAgent, DATE_ADD(NOW(), INTERVAL ${trustHours} HOUR))`,
    {
      adminId,
      tokenHash,
      userAgent
    }
  );

  setTrustedDeviceCookie(res, trustedValue, trustHours * 60 * 60);
  return { trustHours };
}

async function verifyTrustedDevice(req, res, adminId) {
  const cookies = parseCookieHeader(req.get('cookie'));
  const cookieValue = cookies[TRUSTED_DEVICE_COOKIE];
  if (!cookieValue) return false;

  const [cookieAdminId, token] = cookieValue.split('.');
  if (Number(cookieAdminId) !== Number(adminId) || !token) {
    clearTrustedDeviceCookie(res);
    return false;
  }

  const tokenHash = hashTrustedDeviceToken(token);
  const trustedDevice = await getOne(
    `SELECT trusted_device_id
     FROM admin_otp_trusted_devices
     WHERE admin_id = :adminId
       AND token_hash = :tokenHash
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    { adminId, tokenHash }
  );

  if (!trustedDevice) {
    clearTrustedDeviceCookie(res);
    return false;
  }

  await query(
    `UPDATE admin_otp_trusted_devices
     SET last_used_at = NOW()
     WHERE trusted_device_id = :trustedDeviceId`,
    { trustedDeviceId: trustedDevice.trusted_device_id }
  );

  return true;
}

async function createAdminOtp(adminId) {
  await query(
    `UPDATE admin_login_otps
     SET consumed_at = COALESCE(consumed_at, NOW())
     WHERE admin_id = :adminId AND consumed_at IS NULL`,
    { adminId }
  );

  const code = generateOtpCode();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = await hashOtp(code, salt);
  const expiresMinutes = getOtpExpiryMinutes();

  const result = await query(
    `INSERT INTO admin_login_otps
      (admin_id, otp_hash, otp_salt, expires_at)
     VALUES
      (:adminId, :otpHash, :otpSalt, DATE_ADD(NOW(), INTERVAL ${expiresMinutes} MINUTE))`,
    {
      adminId,
      otpHash,
      otpSalt: salt
    }
  );
  const createdOtp = await getOne(
    `SELECT expires_at
     FROM admin_login_otps
     WHERE otp_id = :otpId
     LIMIT 1`,
    { otpId: result.insertId }
  );

  return {
    otpId: result.insertId,
    code,
    expiresAt: createdOtp?.expires_at || new Date(Date.now() + expiresMinutes * 60 * 1000)
  };
}

async function verifyAdminOtp({ otpId, adminId, code }) {
  const otp = await getOne(
    `SELECT *, expires_at <= NOW() AS expired
     FROM admin_login_otps
     WHERE otp_id = :otpId AND admin_id = :adminId
     LIMIT 1`,
    { otpId, adminId }
  );

  if (!otp || otp.consumed_at) {
    return { ok: false, message: 'This login code is no longer valid. Please request a new one.' };
  }

  if (Number(otp.expired) === 1) {
    await query(`UPDATE admin_login_otps SET consumed_at = NOW() WHERE otp_id = :otpId`, { otpId });
    return { ok: false, message: 'This login code expired. Please request a new one.' };
  }

  if (otp.attempts >= getOtpMaxAttempts()) {
    await query(`UPDATE admin_login_otps SET consumed_at = NOW() WHERE otp_id = :otpId`, { otpId });
    return { ok: false, message: 'Too many incorrect code attempts. Please log in again.' };
  }

  const actualHash = await hashOtp(String(code || '').trim(), otp.otp_salt);
  const expected = Buffer.from(otp.otp_hash, 'hex');
  const actual = Buffer.from(actualHash, 'hex');
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

  if (!matches) {
    await query(
      `UPDATE admin_login_otps
       SET attempts = attempts + 1
       WHERE otp_id = :otpId`,
      { otpId }
    );
    return { ok: false, message: 'Incorrect login code. Please check the email and try again.' };
  }

  await query(
    `UPDATE admin_login_otps
     SET consumed_at = NOW()
     WHERE otp_id = :otpId`,
    { otpId }
  );

  return { ok: true };
}

async function sendAdminOtpEmail(user, code, expiresAt) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || process.env.APP_NAME || 'Mary Mother CMS';

  if (!apiKey || !fromEmail) {
    throw new Error('SendGrid is not configured. Add SENDGRID_API_KEY and SENDGRID_FROM_EMAIL to .env.');
  }

  const recipient = getOtpRecipient(user);
  const expiresMinutes = getOtpExpiryMinutes();
  const text = [
    `Your ${process.env.APP_NAME || 'Mary Mother CMS'} admin login code is ${code}.`,
    `It expires in ${expiresMinutes} minutes.`,
    'If you did not request this login, ignore this email and change the admin password.'
  ].join('\n');

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: recipient }],
          subject: 'Mary Mother CMS admin login code'
        }
      ],
      from: {
        email: fromEmail,
        name: fromName
      },
      content: [
        {
          type: 'text/plain',
          value: text
        },
        {
          type: 'text/html',
          value: `<p>Your <strong>${process.env.APP_NAME || 'Mary Mother CMS'}</strong> admin login code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px;">${code}</p><p>It expires in ${expiresMinutes} minutes.</p><p>If you did not request this login, ignore this email and change the admin password.</p>`
        }
      ],
      categories: ['admin-login-otp']
    })
  });

  if (!response.ok) {
    let detail = 'SendGrid rejected the OTP email request.';
    try {
      const result = await response.json();
      detail = result.errors?.[0]?.message || detail;
    } catch (error) {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  return {
    recipient,
    maskedRecipient: maskEmail(recipient),
    expiresAt
  };
}

module.exports = {
  createAdminOtp,
  createTrustedDevice,
  getOtpRecipient,
  getTrustedDeviceHours,
  maskEmail,
  otpEnabled,
  sendAdminOtpEmail,
  verifyAdminOtp,
  verifyTrustedDevice
};
