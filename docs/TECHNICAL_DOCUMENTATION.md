# Technical Documentation

## System Overview

The project is a full-stack CMS-based website for Mary Mother of Mercy Home For the Elderly And Abandoned Foundation. It has two major modules:

- Public website for legacy, caregiver stories, gallery, support information, and contact messages
- Admin CMS for content management, users, uploads, messages, and activity logs

## Architecture

```text
Browser
  -> Express routes
  -> EJS templates
  -> MySQL database
  -> public/uploads for uploaded image files
```

## Database Tables

- `admin_users`: CMS accounts, roles, password hashes, status
- `pages`: editable public page text
- `legacy_entries`: foundation history and milestones
- `caregiver_stories`: privacy-safe staff reflections
- `gallery_categories`: gallery grouping
- `gallery_images`: uploaded image records
- `support_information`: donation and support instructions
- `contact_messages`: public contact form submissions
- `donation_records`: PayMongo checkout donation records
- `events`: public events or participation opportunities
- `event_participations`: submitted participation requests
- `site_videos`: CMS-managed YouTube or Vimeo video links
- `activity_logs`: CMS action tracking

## Security Features

- Session-based protected admin routes
- Salted password hashing with `crypto.scrypt`
- Role-based access control
- File upload MIME validation
- Upload file size limit
- PayMongo webhook signature verification when `PAYMONGO_WEBHOOK_SECRET` is configured
- Escaped template output through EJS
- Escaped multiline CMS rendering helper
- Contact form validation
- Parameterized MySQL queries through `mysql2`

## Role Permissions

| Role | Permissions |
| --- | --- |
| Super Admin | Full CMS access, user management |
| Content Editor | Manage pages, legacy content, stories, gallery, support info, messages, logs |
| Viewer | View dashboard and contact messages only |

## Activity Logging

Important admin actions call `logActivity()` in `src/utils/activityLogger.js`. Logs are stored in `activity_logs` with:

- admin ID
- action
- affected table
- record ID
- timestamp

## Upload Handling

Uploads are configured in `src/config/upload.js`.

Allowed image types:

- JPG
- PNG
- WEBP
- GIF

Uploaded images are stored in:

```text
public/uploads
```

The database stores only the public file path, such as:

```text
/uploads/example.jpg
```

Optional compression is attempted with `sharp`. If `sharp` is not available, upload validation still works.

## PayMongo Donations

The public support page submits donations to `POST /donate`. The backend creates a PayMongo Hosted Checkout Session through `/v2/checkout_sessions`, stores the returned checkout session ID and URL, then redirects the donor to PayMongo.

The webhook endpoint is:

```text
POST /webhooks/paymongo
```

When PayMongo sends `checkout_session.payment.paid`, the matching donation record is marked as paid.

## Google Maps

The public footer and contact page use the Maps Embed API if `GOOGLE_MAPS_EMBED_API_KEY` is set. Without an API key, the site shows a Google Maps search link.

## Videos

Videos are not directly uploaded to the Node server. Staff upload approved videos to YouTube or Vimeo, then paste the URL into the CMS. The system converts supported links into embed URLs.

## Local Development Commands

```bash
npm install
npm run dev
npm start
npm run check
```

## Database Scripts

```text
database/01_schema.sql
database/02_seed.sql
database/03_reset_and_seed.sql
```

Run schema first, then seed.
