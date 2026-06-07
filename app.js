require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');

const { getOne } = require('./src/config/db');
const publicRoutes = require('./src/routes/publicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = Number(process.env.APP_PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.currentPath = req.path;
  req.session.flash = null;
  next();
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
      process.env.FOUNDATION_MAP_QUERY ||
      'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation Philippines';
    const encodedMapQuery = encodeURIComponent(mapQuery);

    res.locals.siteInfo = siteInfo || {};
    res.locals.googleMapEmbedSrc = process.env.GOOGLE_MAPS_EMBED_API_KEY
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(process.env.GOOGLE_MAPS_EMBED_API_KEY)}&q=${encodedMapQuery}`
      : null;
    res.locals.googleMapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
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

app.listen(PORT, () => {
  console.log(`Mary Mother CMS running at http://localhost:${PORT}`);
});
