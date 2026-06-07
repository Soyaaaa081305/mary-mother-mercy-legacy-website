# Full Publishing Guide

This guide is for turning the local academic project into a published website.

For deeper setup details, also read:

- `docs/PAYMONGO_STEP_BY_STEP.md`
- `docs/GOOGLE_MAPS_STEP_BY_STEP.md`
- `docs/PRODUCTION_DEPLOYMENT_SECURITY.md`

## 1. Prepare Real Content

Before publishing:

- Replace all sample foundation text.
- Replace sample support and bank details.
- Confirm the official address, phone, email, Facebook page, and YouTube channel.
- Replace placeholder images with approved foundation images.
- Confirm written permission for any recognizable people in media.
- Keep caregiver stories privacy-safe.

## 2. Use YouTube for Videos

Yes, YouTube is the best simple option for this project.

Recommended flow:

1. Create or access the foundation YouTube account.
2. Upload the video to YouTube.
3. Set visibility to **Public** or **Unlisted**.
4. Copy the YouTube video URL.
5. Login to the CMS.
6. Go to **Videos**.
7. Click **Add Video Link**.
8. Paste the YouTube URL.
9. Publish.

The website embeds the video so visitors can watch it on the website. It also provides a link to open the video directly on YouTube.

## 3. Google Maps API Setup

1. Go to Google Cloud Console.
2. Create a project.
3. Enable **Maps Embed API**.
4. Create an API key.
5. Restrict the key to your website domain.
6. Add the key to production `.env`:

```env
GOOGLE_MAPS_EMBED_API_KEY=your_google_maps_embed_api_key
FOUNDATION_MAP_QUERY=Exact foundation address or place name
```

7. In the CMS, go to **Support Info** and update:

- Foundation Address
- Foundation Email
- Facebook URL
- YouTube URL
- Google Maps Search Query

If no API key is set, the footer now uses a simple Google Maps iframe fallback. For production, use the official Maps Embed API key and restrict it to your domain.

## 4. PayMongo Setup

1. Create a PayMongo account.
2. Complete business verification if you will accept live donations.
3. Open the PayMongo Dashboard.
4. Copy your **test secret key** first.
5. Add it to `.env`:

```env
PAYMONGO_SECRET_KEY=sk_test_your_key_here
PAYMONGO_PAYMENT_METHODS=card,gcash,qrph
PUBLIC_BASE_URL=http://localhost:3000
```

6. Restart the Node server.
7. Go to `/support`.
8. Submit the donation form.
9. The app should redirect to PayMongo Hosted Checkout.
10. Confirm the donation record in **Admin > Donations**.

For production:

```env
PUBLIC_BASE_URL=https://yourdomain.com
PAYMONGO_SECRET_KEY=sk_live_your_live_key_here
PAYMONGO_WEBHOOK_MODE=live
```

## 5. PayMongo Webhook Setup

Use a webhook so successful payments can automatically mark donations as paid.

1. In PayMongo Dashboard, open **Settings > Webhooks**.
2. Create a webhook endpoint:

```text
https://yourdomain.com/webhooks/paymongo
```

3. Subscribe to:

```text
checkout_session.payment.paid
```

4. Copy the webhook secret.
5. Add it to `.env`:

```env
PAYMONGO_WEBHOOK_SECRET=your_webhook_secret
PAYMONGO_WEBHOOK_MODE=live
```

For local testing, use test mode and a public tunnel such as ngrok:

```bash
ngrok http 3000
```

Then set the webhook URL to:

```text
https://your-ngrok-url.ngrok-free.app/webhooks/paymongo
```

## 6. Production Hosting Options

Beginner-friendly options:

- Render for Node.js app hosting
- Railway for Node.js and MySQL
- DigitalOcean App Platform with managed MySQL
- VPS with Node.js, MySQL, Nginx, and PM2

Do not use static-only hosting because this project needs Node.js and MySQL.

## 7. Production Database

Create a production MySQL database, then import:

```bash
mysql -u production_user -p production_database < database/01_schema.sql
mysql -u production_user -p production_database < database/02_seed.sql
```

Then create your real Super Admin user and deactivate or change sample accounts.

## 8. Production Environment Variables

Use production values:

```env
APP_NAME="Mary Mother of Mercy CMS"
APP_PORT=3000
SESSION_SECRET=use-a-long-random-secret

DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name

PUBLIC_BASE_URL=https://yourdomain.com

PAYMONGO_SECRET_KEY=sk_live_your_key_here
PAYMONGO_PAYMENT_METHODS=card,gcash,qrph
PAYMONGO_WEBHOOK_SECRET=your_webhook_secret
PAYMONGO_WEBHOOK_MODE=live

GOOGLE_MAPS_EMBED_API_KEY=your_google_maps_key
FOUNDATION_MAP_QUERY=exact address here
```

## 9. Domain and HTTPS

1. Buy or use a domain.
2. Point DNS to your hosting provider.
3. Enable HTTPS or SSL.
4. Set `PUBLIC_BASE_URL` to the HTTPS domain.
5. Update PayMongo webhook URL to the HTTPS domain.
6. Restrict Google Maps API key to the domain.

## 10. Final Production Safety Checklist

- [ ] Sample passwords changed
- [ ] Sample bank details replaced
- [ ] PayMongo live key configured
- [ ] PayMongo webhook configured
- [ ] Google Maps key restricted
- [ ] HTTPS enabled
- [ ] Database backups enabled
- [ ] Upload folder persistent in hosting
- [ ] Privacy-safe content reviewed
- [ ] Real contact information verified
- [ ] Admin accounts limited to authorized staff
