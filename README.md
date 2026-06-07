# Mary Mother of Mercy Home Legacy Website CMS

A complete local full-stack academic project for:

**Mary Mother of Mercy Home Legacy Website: A Dynamic Content Management and Storytelling Platform**

The system includes a public website, admin CMS, MySQL database scripts, CRUD features, contact messages, image upload handling, activity logs, and privacy-safe caregiver storytelling.

## Tech Stack

- Frontend: HTML, CSS, EJS templates
- Backend: Node.js + Express
- Database: MySQL
- Authentication: Session-based login
- Uploads: Local `public/uploads` folder with image type validation
- Password hashing: Node.js `crypto.scrypt`

## Project Folder Structure

```text
Mary Mother/
├── app.js
├── package.json
├── .env.example
├── database/
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── 03_reset_and_seed.sql
│   └── 04_upgrade_donations_events_videos.sql
├── docs/
│   ├── ADMIN_USER_MANUAL.md
│   ├── FINAL_CHECKLIST.md
│   ├── GOOGLE_MAPS_STEP_BY_STEP.md
│   ├── PAYMONGO_STEP_BY_STEP.md
│   ├── PRODUCTION_DEPLOYMENT_SECURITY.md
│   ├── PUBLISHING_GUIDE.md
│   ├── PROJECT_REPORT_CONTENT.md
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── TESTING_CHECKLIST.md
│   └── VIDEO_SCRIPT.md
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

## Quick Start in VS Code

1. Open this folder in VS Code.
2. Install Node.js LTS from <https://nodejs.org/> if your computer does not already have it.
3. Install MySQL through XAMPP, Laragon, MySQL Installer, or MySQL Workbench.
4. Copy `.env.example` to `.env`.
5. Install dependencies:

```bash
npm install
```

6. Create the database:

```bash
mysql -u root -p < database/01_schema.sql
mysql -u root -p mary_mother_cms < database/02_seed.sql
```

If you use phpMyAdmin, open `database/01_schema.sql` and run it first, then run `database/02_seed.sql`.

On Mac with XAMPP, the MySQL command may be:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root < database/01_schema.sql
/Applications/XAMPP/xamppfiles/bin/mysql -u root mary_mother_cms < database/02_seed.sql
```

7. Start the app:

```bash
npm run dev
```

8. Open:

- Public website: <http://localhost:3000>
- Admin CMS: <http://localhost:3000/admin/login>

## Sample Admin Accounts

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@marymother.local` | `admin123` |
| Content Editor | `editor@marymother.local` | `editor123` |
| Viewer | `viewer@marymother.local` | `viewer123` |

## Important Pages

Public website:

- `/`
- `/about`
- `/legacy`
- `/caregiver-stories`
- `/gallery`
- `/events`
- `/videos`
- `/support`
- `/contact`

Admin CMS:

- `/admin/dashboard`
- `/admin/pages`
- `/admin/legacy`
- `/admin/stories`
- `/admin/gallery`
- `/admin/events`
- `/admin/videos`
- `/admin/support/edit`
- `/admin/donations`
- `/admin/messages`
- `/admin/users`
- `/admin/activity`

## Notes

- Replace placeholder images and sample support/bank details before any real public use.
- The caregiver story CMS includes a privacy reminder. Do not publish real resident names, health information, personal trauma, or identifiable details.
- This project is designed for local academic demonstration, not production hosting.
- For production, configure PayMongo, Google Maps Embed API, a real domain, HTTPS, and production environment variables.
