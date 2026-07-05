require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');

const { getOne, pool } = require('./src/config/db');
const { csrfProtection } = require('./src/middleware/csrf');
const publicRoutes = require('./src/routes/publicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { setupDatabase } = require('./src/utils/databaseSetup');

const app = express();
const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY || '';
const paymongoWebhookMode = process.env.PAYMONGO_WEBHOOK_MODE === 'live' ? 'live' : 'test';
const isPaymongoTestMode = !paymongoSecretKey.startsWith('sk_live_') || paymongoWebhookMode !== 'live';
const fallbackMapQuery = process.env.FOUNDATION_MAP_QUERY ||
  'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation Philippines';

function setMapLocals(res, mapQuery) {
  const encodedMapQuery = encodeURIComponent(mapQuery || fallbackMapQuery);

  res.locals.googleMapEmbedSrc = process.env.GOOGLE_MAPS_EMBED_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(process.env.GOOGLE_MAPS_EMBED_API_KEY)}&q=${encodedMapQuery}`
    : `https://www.google.com/maps?q=${encodedMapQuery}&output=embed`;
  res.locals.googleMapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  if (req.path.startsWith('/admin')) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  if (req.path.startsWith('/webhooks') || req.path.startsWith('/webhook_paymongo')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  next();
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buffer) => {
    req.rawBody = buffer.toString('utf8');
  }
}));
app.use(methodOverride('_method'));
app.use(
  session({
    name: 'mary_mother_sid',
    secret: process.env.SESSION_SECRET || 'development-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.currentPath = req.path;
  res.locals.isPaymongoTestMode = isPaymongoTestMode;
  res.locals.siteInfo = {};
  setMapLocals(res, fallbackMapQuery);
  req.session.flash = null;
  next();
});

app.use(csrfProtection);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'mary-mother-cms',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(async (req, res, next) => {
  try {
    const siteInfo = await getOne(
      `SELECT * FROM support_information
       ORDER BY updated_at DESC
       LIMIT 1`
    );
    const mapQuery = siteInfo?.google_maps_query ||
      siteInfo?.foundation_address ||
      fallbackMapQuery;

    res.locals.siteInfo = siteInfo || {};
    setMapLocals(res, mapQuery);
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', publicRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('public/404', {
    title: 'Page Not Found'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again later.'
    : err.message;

  if (req.path.startsWith('/admin')) {
    req.session.flash = { type: 'danger', message };
    return res.redirect('/admin/dashboard');
  }

  return res.status(500).render('public/error', {
    title: 'Server Error',
    message
  });
});

async function start() {
  if (process.env.AUTO_INIT_DB === 'true') {
    await setupDatabase(pool, { initializeIfEmpty: true });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Mary Mother CMS running at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
