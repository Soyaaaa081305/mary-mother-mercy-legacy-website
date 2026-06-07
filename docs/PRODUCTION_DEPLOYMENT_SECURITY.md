# Full Production Deployment and Security Guide

This project needs Node.js and MySQL. Do not deploy it to static-only hosting.

## 1. Prepare the Project

Before uploading:

- Replace all placeholder text.
- Replace sample bank details.
- Replace placeholder images.
- Replace sample video link.
- Change sample admin passwords.
- Confirm the real foundation address and contact details.
- Review all caregiver stories for privacy safety.

## 2. Choose Hosting

Beginner-friendly options:

- Railway: Node.js app plus MySQL
- Render: Node.js app, with external MySQL such as PlanetScale, Aiven, or Railway MySQL
- DigitalOcean App Platform plus managed MySQL
- VPS: Ubuntu, Node.js, MySQL, Nginx, PM2, Certbot

For easiest class/demo publishing, Railway is usually the simplest because it can host both the app and database.

## 3. Production Environment Variables

Set these on your hosting provider:

```env
NODE_ENV=production
APP_NAME="Mary Mother of Mercy CMS"
APP_PORT=3000
SESSION_SECRET=generate-a-long-random-secret

DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

PUBLIC_BASE_URL=https://yourdomain.com

PAYMONGO_SECRET_KEY=sk_live_your_key
PAYMONGO_PAYMENT_METHODS=card,gcash,qrph
PAYMONGO_SEND_EMAIL_RECEIPT=true
PAYMONGO_PASS_ON_FEES=false
PAYMONGO_WEBHOOK_SECRET=your_live_webhook_secret
PAYMONGO_WEBHOOK_MODE=live

GOOGLE_MAPS_EMBED_API_KEY=your_restricted_maps_key
FOUNDATION_MAP_QUERY=exact foundation address
```

Never commit `.env` to GitHub.

## 4. Create the Production Database

Import:

```bash
mysql -u your_user -p your_database < database/01_schema.sql
mysql -u your_user -p your_database < database/02_seed.sql
```

After import:

- Change sample admin passwords.
- Deactivate unused sample accounts.
- Replace sample content.

## 5. Uploads and Persistent Storage

The folder below must persist:

```text
public/uploads
```

If your host resets local storage during deployments, use object storage such as S3, Cloudinary, or a persistent volume.

## 6. Domain Setup

1. Buy or use a domain.
2. In your hosting provider, add the domain.
3. In your domain DNS, add the required records:

- `A` record if your host gives an IP address
- `CNAME` record if your host gives a hostname

4. Wait for DNS propagation.
5. Enable HTTPS.
6. Set:

```env
PUBLIC_BASE_URL=https://yourdomain.com
```

## 7. HTTPS

HTTPS is required for production safety and payment flow trust.

If using Render/Railway/DigitalOcean App Platform, enable HTTPS in the dashboard.

If using a VPS:

```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 8. PayMongo Production Setup

1. Complete PayMongo business verification.
2. Use live secret key.
3. Set live webhook:

```text
https://yourdomain.com/webhooks/paymongo
```

4. Subscribe to:

```text
checkout_session.payment.paid
```

5. Add webhook secret to hosting environment variables.
6. Test one small live payment.

## 9. Google Maps Production Setup

1. Enable Maps Embed API.
2. Restrict API key to your domain.
3. Restrict API usage to Maps Embed API only.
4. Add the key to hosting environment variables.

## 10. Security Checklist

- [ ] `NODE_ENV=production`
- [ ] long random `SESSION_SECRET`
- [ ] `.env` not committed
- [ ] HTTPS enabled
- [ ] sample admin passwords changed
- [ ] unused admin users deactivated
- [ ] least-privilege MySQL user created
- [ ] MySQL not publicly open unless required by host
- [ ] database backups enabled
- [ ] PayMongo live webhook configured
- [ ] Google Maps API key restricted
- [ ] upload folder persistence confirmed
- [ ] privacy-safe content reviewed
- [ ] CSRF protection enabled
- [ ] activity logs reviewed after launch

## 11. Recommended Maintenance

- Back up the database weekly.
- Rotate admin passwords after staff changes.
- Review activity logs.
- Keep Node.js dependencies updated.
- Check PayMongo dashboard for failed or suspicious payments.
- Check Google Cloud billing alerts.

