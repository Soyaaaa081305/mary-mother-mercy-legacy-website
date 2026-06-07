# Final VS Code Run Checklist

Use this checklist to run the complete project locally.

## 1. Required Software

- VS Code installed
- Node.js LTS installed
- MySQL installed through XAMPP, Laragon, MySQL Installer, or MySQL Workbench
- This project folder opened in VS Code

## 2. Open the Project

1. Open VS Code.
2. Click **File > Open Folder**.
3. Select:

```text
/Users/isaiahnoda/Documents/Mary Mother
```

## 3. Install Backend Packages

Open the VS Code terminal and run:

```bash
npm install
```

This installs Express, EJS, MySQL connector, sessions, file upload handling, and optional image compression.

## 4. Create the Environment File

Copy `.env.example` and rename it to `.env`.

Use these local defaults:

```env
APP_NAME="Mary Mother of Mercy CMS"
APP_PORT=3000
SESSION_SECRET=change-this-secret

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mary_mother_cms
```

If your MySQL root user has a password, put it in `DB_PASSWORD`.

Extra setup guides:

```text
docs/PAYMONGO_STEP_BY_STEP.md
docs/GOOGLE_MAPS_STEP_BY_STEP.md
docs/PRODUCTION_DEPLOYMENT_SECURITY.md
docs/PUBLISHING_GUIDE.md
```

## 5. Run the Database Scripts

Run these scripts in this order.

### Option A: MySQL Terminal

```bash
mysql -u root -p < database/01_schema.sql
mysql -u root -p mary_mother_cms < database/02_seed.sql
```

On your Mac with XAMPP, use this if `mysql` says command not found:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root < database/01_schema.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/02_seed.sql
```

If you already imported the old database before donations/events/videos were added, run:

```bash
mysql -u root -p mary_mother_cms < database/04_upgrade_donations_events_videos.sql
```

XAMPP version:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/04_upgrade_donations_events_videos.sql
```

### Option B: phpMyAdmin

1. Start Apache and MySQL in XAMPP.
2. Open <http://localhost/phpmyadmin>.
3. Click **Import**.
4. Import `database/01_schema.sql`.
5. Import `database/02_seed.sql`.

### Option C: MySQL Workbench

1. Open MySQL Workbench.
2. Connect to local MySQL.
3. Open `database/01_schema.sql`.
4. Run the script.
5. Open `database/02_seed.sql`.
6. Run the script.

## 6. Start the Server

```bash
npm run dev
```

The terminal should show:

```text
Mary Mother CMS running at http://localhost:3000
```

## 7. Open the Website

Public website:

```text
http://localhost:3000
```

Admin CMS:

```text
http://localhost:3000/admin/login
```

## 8. Login Accounts

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@marymother.local` | `admin123` |
| Content Editor | `editor@marymother.local` | `editor123` |
| Viewer | `viewer@marymother.local` | `viewer123` |

## 9. Main Admin Demo Flow

1. Login as Super Admin.
2. View dashboard statistics.
3. Edit text content in **Pages**.
4. Add a new **Legacy Content** entry.
5. Add a new **Caregiver Story** and read the privacy reminder.
6. Upload a **Gallery** image.
7. Add an **Event** and submit a public participation request.
8. Add a **Video** using a YouTube link.
9. Edit **Support Info**, address, map query, and social links.
10. Test **Donation** checkout after PayMongo keys are configured.
11. Submit the public contact form.
12. View the saved message in **Messages**.
13. Check **Activity Logs** for recorded admin actions.
14. Add or deactivate an admin user.
15. Logout.

## 10. API and Route Map

Public routes:

```text
GET  /
GET  /about
GET  /legacy
GET  /legacy/:id
GET  /caregiver-stories
GET  /caregiver-stories/:id
GET  /gallery
GET  /events
GET  /events/:id
POST /events/:id/participate
GET  /videos
GET  /support
POST /donate
GET  /donation/success
GET  /donation/cancel
POST /webhooks/paymongo
GET  /contact
POST /contact
```

Admin auth routes:

```text
GET  /admin/login
POST /admin/login
POST /admin/logout
```

Admin CMS routes:

```text
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

GET  /admin/events
GET  /admin/events/new
POST /admin/events
GET  /admin/events/:id/edit
POST /admin/events/:id
POST /admin/events/:id/delete
POST /admin/events/participations/:id/status
POST /admin/events/participations/:id/delete

GET  /admin/videos
GET  /admin/videos/new
POST /admin/videos
GET  /admin/videos/:id/edit
POST /admin/videos/:id
POST /admin/videos/:id/delete

GET  /admin/donations
POST /admin/donations/:id/status

GET  /admin/support/edit
POST /admin/support

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

GET  /admin/activity
```

## 11. What Is Downloadable

The complete downloadable project ZIP is:

```text
MaryMotherCMS.zip
```

It contains the database scripts, backend code, frontend code, admin CMS, public pages, docs, placeholder images, and setup checklist.

## 12. Troubleshooting

If `npm install` fails, install Node.js LTS and restart VS Code.

If the app cannot connect to MySQL, check `.env` values and make sure MySQL is running.

If login does not work, confirm that `database/02_seed.sql` was imported.

If uploaded images do not show, confirm that `public/uploads` exists and the server was started from the project root.

If port 3000 is busy, change `APP_PORT` in `.env`, for example:

```env
APP_PORT=3001
```
