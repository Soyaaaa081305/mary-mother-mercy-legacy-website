# Mary Mother of Mercy Home Legacy Website CMS

A local full-stack Node.js, Express, EJS, and MySQL CMS for the **Mary Mother of Mercy Home Legacy Website: A Dynamic Content Management and Storytelling Platform**.

This project includes the public website, admin CMS, editable page hero sections, contact team profiles, gallery, videos, events, event participation requests, PayMongo donation checkout, SendGrid admin OTP login, Google Maps support, contact messages, image uploads, and dashboard activity history.

## Requirements

- Visual Studio Code
- Node.js LTS
- XAMPP MySQL, MySQL Workbench, Laragon, or another MySQL server
- Optional for local PayMongo webhook testing: ngrok
- Optional for admin OTP email: SendGrid account

## Folder Structure

```text
Mary Mother/
├── app.js
├── package.json
├── .env.example
├── database/
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   ├── 03_reset_and_seed.sql
│   ├── 04_upgrade_donations_events_videos.sql
│   ├── 05_upgrade_polish_heroes_contact_team.sql
│   ├── 06_upgrade_admin_otp_sendgrid.sql
│   ├── 07_populate_mary_mother_content.sql
│   └── 08_prepare_cloud_deployment.sql
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   ├── images/placeholders/
│   └── uploads/
├── scripts/
│   └── check-syntax.js
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── utils/
└── views/
    ├── admin/
    ├── partials/
    └── public/
```

## Quick Start

Open the folder in VS Code:

```bash
cd "/Users/isaiahnoda/Documents/Mary Mother"
```

Install packages:

```bash
npm install
```

Create `.env` only if it does not already exist:

```bash
cp .env.example .env
```

Do not run that copy command again after configuring PayMongo, SendGrid, or Google Maps because it can overwrite your local settings.

Create a fresh database:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root < database/01_schema.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/02_seed.sql
```

If your MySQL root user has a password:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p < database/01_schema.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p mary_mother_cms < database/02_seed.sql
```

Start the app:

```bash
npm run dev
```

Open:

```text
Public website: http://localhost:3000
Admin CMS:      http://localhost:3000/admin/login
```

## Existing Database Upgrades

If you already imported an older copy of the database, run the upgrade scripts instead of resetting the database:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/04_upgrade_donations_events_videos.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/05_upgrade_polish_heroes_contact_team.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/06_upgrade_admin_otp_sendgrid.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/07_populate_mary_mother_content.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/08_prepare_cloud_deployment.sql
```

## Environment Variables

Use `.env.example` as the template. Important local values:

```env
APP_NAME="Mary Mother of Mercy CMS"
APP_PORT=3000
PORT=
NODE_ENV=development
SESSION_SECRET=replace-this-with-a-long-random-secret

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mary_mother_cms
DATABASE_URL=
MYSQL_URL=
DB_SSL_MODE=
DB_SSL_CA_PATH=
DB_SSL_CA=
DB_SSL_REJECT_UNAUTHORIZED=

CLOUDINARY_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=mary-mother-cms

PUBLIC_BASE_URL=http://localhost:3000

PAYMONGO_SECRET_KEY=
PAYMONGO_PAYMENT_METHODS=card,gcash,qrph
PAYMONGO_SEND_EMAIL_RECEIPT=true
PAYMONGO_PASS_ON_FEES=false
PAYMONGO_WEBHOOK_SECRET=
PAYMONGO_WEBHOOK_MODE=test

ADMIN_OTP_ENABLED=false
ADMIN_OTP_EXPIRES_MINUTES=10
ADMIN_OTP_MAX_ATTEMPTS=5
ADMIN_OTP_TRUST_HOURS=12
ADMIN_OTP_TEST_RECIPIENT=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME="Mary Mother CMS"

GOOGLE_MAPS_EMBED_API_KEY=
FOUNDATION_MAP_QUERY=Mary Mother of Mercy Home For the Elderly And Abandoned Foundation Philippines
```

Your private `.env` is ignored by Git and excluded from the project ZIP.

## Admin Accounts

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@marymother.local` | `admin123` |
| Content Editor | `editor@marymother.local` | `editor123` |
| Viewer | `viewer@marymother.local` | `viewer123` |

If `ADMIN_OTP_ENABLED=true`, the app sends a 6-digit login code after the password step. The OTP screen includes a **Trust this device for 12 hours** checkbox. When checked after a successful OTP, the browser receives a secure trusted-device cookie, and the next password login from that browser skips OTP until the cookie expires. For local testing, `ADMIN_OTP_TEST_RECIPIENT` can send all OTP codes to one real inbox while sample admin emails remain unchanged.

## Public Pages

```text
GET  /health
GET  /
GET  /about
GET  /legacy
GET  /legacy/:id
GET  /caregiver-stories
GET  /caregiver-stories/:id
GET  /gallery
GET  /videos
GET  /events
GET  /events/:id
POST /events/:id/participate
GET  /support
POST /donate
GET  /donation/success
GET  /donation/cancel
POST /webhooks/paymongo
POST /webhook_paymongo.php
GET  /contact
POST /contact
```

## Admin Routes

```text
GET  /admin/login
POST /admin/login
GET  /admin/verify-otp
POST /admin/verify-otp
POST /admin/resend-otp
POST /admin/logout

GET  /admin/dashboard
GET  /admin/pages
GET  /admin/pages/:id/edit
POST /admin/pages/:id

GET  /admin/legacy
GET  /admin/legacy/new
POST /admin/legacy
GET  /admin/legacy/:id/edit
POST /admin/legacy/:id
POST /admin/legacy/:id/delete

GET  /admin/stories
GET  /admin/stories/new
POST /admin/stories
GET  /admin/stories/:id/edit
POST /admin/stories/:id
POST /admin/stories/:id/delete

GET  /admin/gallery
GET  /admin/gallery/categories/new
POST /admin/gallery/categories
GET  /admin/gallery/categories/:id/edit
POST /admin/gallery/categories/:id
POST /admin/gallery/categories/:id/delete
GET  /admin/gallery/images/new
POST /admin/gallery/images
GET  /admin/gallery/images/:id/edit
POST /admin/gallery/images/:id
POST /admin/gallery/images/:id/delete

GET  /admin/videos
GET  /admin/videos/new
POST /admin/videos
GET  /admin/videos/:id/edit
POST /admin/videos/:id
POST /admin/videos/:id/delete

GET  /admin/events
GET  /admin/events/new
POST /admin/events
GET  /admin/events/:id/edit
POST /admin/events/:id
POST /admin/events/:id/delete
POST /admin/events/participations/:id/status
POST /admin/events/participations/:id/delete

GET  /admin/donations
POST /admin/donations/:id/status

GET  /admin/support/edit
POST /admin/support

GET  /admin/contact-team
GET  /admin/contact-team/new
POST /admin/contact-team
GET  /admin/contact-team/:id/edit
POST /admin/contact-team/:id
POST /admin/contact-team/:id/delete

GET  /admin/messages
GET  /admin/messages/:id
POST /admin/messages/:id/toggle
POST /admin/messages/:id/delete

GET  /admin/users
GET  /admin/users/new
POST /admin/users
GET  /admin/users/:id/edit
POST /admin/users/:id
POST /admin/users/:id/deactivate
```

## Main CMS Workflow

1. Login as Super Admin.
2. If OTP is enabled, enter the emailed 6-digit code.
3. Edit page text, hero summary, and hero image in **Pages**.
4. Add legacy entries.
5. Add privacy-safe caregiver stories.
6. Upload gallery images.
7. Add YouTube or Vimeo video links.
8. Add events and review participation requests.
9. Edit support/donation information.
10. Add contact team members.
11. Review donation records.
12. Review contact messages.
13. Manage admin users.

## PayMongo Setup

Use the PayMongo **secret key**, not the public key:

```env
PAYMONGO_SECRET_KEY=sk_test_your_key_here
PAYMONGO_PAYMENT_METHODS=card,gcash,qrph
PAYMONGO_WEBHOOK_SECRET=your_webhook_secret
PAYMONGO_WEBHOOK_MODE=test
```

The public key that starts with `pk_` is not used because this app creates Hosted Checkout Sessions on the backend.

For local testing through ngrok:

```env
PUBLIC_BASE_URL=https://your-ngrok-domain.ngrok-free.dev
```

Start the app in one terminal:

```bash
npm run dev
```

Start ngrok in a second terminal:

```bash
ngrok http 3000
```

If you have a fixed ngrok domain:

```bash
ngrok http --url=your-ngrok-domain.ngrok-free.dev 3000
```

PayMongo webhook URL options:

```text
https://your-ngrok-domain.ngrok-free.dev/webhooks/paymongo
https://your-ngrok-domain.ngrok-free.dev/webhook_paymongo.php
```

Subscribe the webhook to:

```text
checkout_session.payment.paid
```

If PayMongo checkout returns to an `ERR_NGROK_3200` page, ngrok is offline. Restart ngrok and refresh the return URL. If the payment is paid in PayMongo but the CMS still says `Redirected`, either retry the webhook in PayMongo or manually mark the record as `Paid` in **Admin > Donations** after confirming it.

## SendGrid Admin OTP Setup

1. Create or open a SendGrid account.
2. Verify a sender email in **Settings > Sender Authentication**.
3. Create a SendGrid API key with **Mail Send** permission.
4. Add these values to `.env`:

```env
ADMIN_OTP_ENABLED=true
ADMIN_OTP_TRUST_HOURS=12
ADMIN_OTP_TEST_RECIPIENT=your-real-email@example.com
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email@example.com
SENDGRID_FROM_NAME="Mary Mother CMS"
```

For production, remove `ADMIN_OTP_TEST_RECIPIENT` and make every admin account use a real email address.

If you get locked out while testing, temporarily set:

```env
ADMIN_OTP_ENABLED=false
```

Then restart the app.

## Google Maps Setup

The site works without a Google Maps API key by using a Google Maps fallback iframe/search URL.

For production:

1. Create a Google Cloud project.
2. Enable **Maps Embed API**.
3. Create an API key.
4. Restrict the key to your domain.
5. Restrict the key to Maps Embed API only.
6. Add:

```env
GOOGLE_MAPS_EMBED_API_KEY=your_google_maps_embed_api_key
FOUNDATION_MAP_QUERY=exact foundation address
```

The map query can also be edited in **Admin > Support Info**.

## Videos

Do not upload video files directly to this Node app. Upload approved videos to YouTube or Vimeo, then paste the public or unlisted video link into **Admin > Videos**. The website embeds the video and also provides an external watch link.

## Security Notes

- Keep `.env` private.
- Change sample passwords before public use.
- Use `NODE_ENV=production` in production.
- Use a long random `SESSION_SECRET`.
- Use HTTPS for production.
- The app sends basic security headers, hides Express branding, blocks crawler indexing for admin/webhook URLs, and disables admin page caching.
- Restrict Google Maps API keys.
- Use PayMongo live keys only after business verification.
- Keep SendGrid API keys private.
- Use real admin emails in production.
- Review caregiver stories for privacy and consent.
- Confirm uploaded photos have permission if people are recognizable.
- Enable database backups before publishing.

## Render + Aiven + Cloudinary Deployment

Recommended free-friendly stack:

```text
App hosting: Render Free Web Service
Database:    Aiven Free MySQL
Uploads:     Cloudinary Free
Code:        GitHub repository connected to Render
```

Official setup references:

- [Render web services](https://render.com/docs/web-services)
- [Render environment variables](https://render.com/docs/configure-environment-variables)
- [Aiven Free Tier](https://aiven.io/free-tier)
- [Aiven for MySQL](https://aiven.io/mysql)
- [Cloudinary Node.js uploads](https://cloudinary.com/documentation/node_image_and_video_upload)

Render free web services can spin down after inactivity, so the first request after an idle period may be slow. That is acceptable for a student/demo deployment, but it is not ideal for mission-critical production.

### Cloudinary Uploads

Admin image uploads use local `public/uploads` by default. When Cloudinary credentials are configured, the same admin upload forms send optimized images to Cloudinary and store Cloudinary HTTPS URLs in MySQL.

Use either `CLOUDINARY_URL`:

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_FOLDER=mary-mother-cms
```

Or separate Cloudinary values:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=mary-mother-cms
```

Do not commit real Cloudinary credentials. Keep them in `.env` locally and in Render environment variables for production.

### Aiven MySQL

Create an Aiven for MySQL service and either create a database named `mary_mother_cms` or update `DB_NAME`/`DATABASE_URL` to match the database you use.

If importing from your local terminal with the MySQL CLI:

```bash
mysql --ssl-mode=VERIFY_CA --ssl-ca=/absolute/path/to/aiven-ca.pem -h AIVEN_HOST -P AIVEN_PORT -u avnadmin -p < database/03_reset_and_seed.sql
```

If your MySQL client cannot process `SOURCE` commands, run these in order instead:

```bash
mysql --ssl-mode=VERIFY_CA --ssl-ca=/absolute/path/to/aiven-ca.pem -h AIVEN_HOST -P AIVEN_PORT -u avnadmin -p < database/01_schema.sql
mysql --ssl-mode=VERIFY_CA --ssl-ca=/absolute/path/to/aiven-ca.pem -h AIVEN_HOST -P AIVEN_PORT -u avnadmin -p mary_mother_cms < database/02_seed.sql
mysql --ssl-mode=VERIFY_CA --ssl-ca=/absolute/path/to/aiven-ca.pem -h AIVEN_HOST -P AIVEN_PORT -u avnadmin -p mary_mother_cms < database/07_populate_mary_mother_content.sql
mysql --ssl-mode=VERIFY_CA --ssl-ca=/absolute/path/to/aiven-ca.pem -h AIVEN_HOST -P AIVEN_PORT -u avnadmin -p mary_mother_cms < database/08_prepare_cloud_deployment.sql
```

For Render, add the Aiven CA certificate as a Render secret file named `aiven-ca.pem`. Render exposes secret files under `/etc/secrets`, so set:

```env
DB_SSL_MODE=verify-ca
DB_SSL_CA_PATH=/etc/secrets/aiven-ca.pem
```

Then configure the database connection with either a URI:

```env
DATABASE_URL=mysql://avnadmin:password@host:port/mary_mother_cms
```

Or separate values:

```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=mary_mother_cms
```

### Render Web Service

1. Push the repository to GitHub.
2. In Render, create **New > Web Service**.
3. Connect the GitHub repository.
4. Select the Free instance type for the demo.
5. Set the build command:

```bash
npm install
```

6. Set the start command:

```bash
npm start
```

7. Set the health check path:

```text
/health
```

8. Add environment variables in Render:

```env
NODE_ENV=production
SESSION_SECRET=generate-a-long-random-secret
PUBLIC_BASE_URL=https://your-render-service.onrender.com

DATABASE_URL=mysql://avnadmin:password@host:port/mary_mother_cms
DB_SSL_MODE=verify-ca
DB_SSL_CA_PATH=/etc/secrets/aiven-ca.pem

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_FOLDER=mary-mother-cms

PAYMONGO_SECRET_KEY=
PAYMONGO_WEBHOOK_SECRET=
PAYMONGO_WEBHOOK_MODE=test

ADMIN_OTP_ENABLED=false
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME="Mary Mother CMS"

GOOGLE_MAPS_EMBED_API_KEY=
FOUNDATION_MAP_QUERY=Mary Mother of Mercy Home For the Elderly And Abandoned Foundation Philippines
```

Render sets `PORT` automatically, and the app now reads `PORT` before `APP_PORT`.

9. Deploy the service.
10. Open `/health` and confirm it returns JSON with `"status":"ok"`.
11. Open `/admin/login`, sign in, and immediately change sample passwords before public sharing.
12. Upload a test gallery image and confirm the saved image URL starts with `https://res.cloudinary.com/`.
13. Configure PayMongo webhook URLs if donation checkout will be demonstrated:

```text
https://your-render-service.onrender.com/webhooks/paymongo
https://your-render-service.onrender.com/webhook_paymongo.php
```

14. Set `PUBLIC_BASE_URL` to the custom domain later if you add one.

### Public Demo With PayMongo Test Mode

For a public demo where no real money is collected:

```env
NODE_ENV=production
PUBLIC_BASE_URL=https://your-public-demo-url
PAYMONGO_SECRET_KEY=sk_test_your_key_here
PAYMONGO_WEBHOOK_SECRET=your_test_webhook_secret
PAYMONGO_WEBHOOK_MODE=test
```

The donation page automatically shows a test-mode notice unless both of these are true:

```text
PAYMONGO_SECRET_KEY starts with sk_live_
PAYMONGO_WEBHOOK_MODE=live
```

Use these PayMongo webhook URLs after the app is public:

```text
https://your-public-demo-url/webhooks/paymongo
https://your-public-demo-url/webhook_paymongo.php
```

Production checklist:

```text
NODE_ENV=production
SESSION_SECRET is long and random
PUBLIC_BASE_URL=https://yourdomain.com
Sample admin passwords changed
Sample bank details replaced
Aiven MySQL import completed
Cloudinary upload test completed
PayMongo test key configured for demo, or live key only after approval
PayMongo webhook configured and mode matches the key type
SendGrid sender verified
Google Maps key restricted
HTTPS enabled
Database backups enabled
Privacy-safe content reviewed
```

## Testing Checklist

Run:

```bash
npm run check
```

Then check:

```text
http://localhost:3000
http://localhost:3000/about
http://localhost:3000/legacy
http://localhost:3000/caregiver-stories
http://localhost:3000/gallery
http://localhost:3000/videos
http://localhost:3000/events
http://localhost:3000/support
http://localhost:3000/contact
http://localhost:3000/admin/login
http://localhost:3000/health
```

Admin checks:

- Login works.
- OTP works if enabled.
- Dashboard scrolls.
- Pages editor live preview works.
- Contact Team editor live preview works.
- Support page PayMongo button is centered.
- Contact page shows official contact information and team cards.
- Gallery upload accepts images and rejects non-images.
- Event participation form saves requests.
- PayMongo checkout redirects.
- PayMongo webhook endpoint rejects unsigned test posts and accepts signed PayMongo events.

## Troubleshooting

### `npm: command not found`

Install Node.js LTS and restart VS Code.

### `mysql: command not found`

Use XAMPP's MySQL binary:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms
```

### `EADDRINUSE: address already in use :::3000`

The app is already running on port 3000. Open `http://localhost:3000`, or stop the old process:

```bash
lsof -tiTCP:3000 -sTCP:LISTEN | xargs kill
npm run dev
```

### phpMyAdmin cannot connect

Start MySQL in XAMPP first. If phpMyAdmin still fails, check the XAMPP MySQL service and port.

### ngrok `ERR_NGROK_3200`

The ngrok tunnel is offline. Start ngrok again:

```bash
ngrok http --url=your-ngrok-domain.ngrok-free.dev 3000
```

### Donation checkout says PayMongo is not configured

Check `.env`:

```env
PAYMONGO_SECRET_KEY=sk_test_or_live_key
```

Restart the app after editing `.env`.

### OTP email does not arrive

Check:

- SendGrid API key exists.
- Sender email is verified.
- `SENDGRID_FROM_EMAIL` matches the verified sender.
- Spam/promotions inbox.
- SendGrid Activity Feed.

### Uploaded images do not show

For local uploads, make sure `public/uploads` exists and the app is started from the project root.

For Render uploads, make sure Cloudinary env vars are set and upload a new test image from **Admin > Gallery**. The stored image URL should start with `https://res.cloudinary.com/`.

## Downloadable ZIP

The downloadable project file is:

```text
MaryMotherCMS.zip
```

It excludes:

```text
.env
.git/
node_modules/
```

Run `npm install` after extracting the ZIP.
