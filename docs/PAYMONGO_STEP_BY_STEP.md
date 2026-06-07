# PayMongo Step-by-Step Setup

Use this when the PayMongo API is not working.

## 1. Use the Correct Key

In PayMongo Dashboard, copy the **Secret Key**, not the public key.

Correct:

```text
sk_test_...
sk_live_...
```

Wrong:

```text
pk_test_...
pk_live_...
```

Add the key to `.env`:

```env
PAYMONGO_SECRET_KEY=sk_test_your_key_here
```

Restart the server after changing `.env`.

## 2. Start With Card Only

Some payment methods may not be active yet on your PayMongo account. For testing, start with:

```env
PAYMONGO_PAYMENT_METHODS=card
```

After card checkout works, try:

```env
PAYMONGO_PAYMENT_METHODS=card,gcash,qrph
```

If PayMongo rejects GCash or QR Ph, that method may not be activated for your account yet.

## 3. Set the Correct Base URL

Local development:

```env
PUBLIC_BASE_URL=http://localhost:3000
```

If you are running on port 3001:

```env
APP_PORT=3001
PUBLIC_BASE_URL=http://localhost:3001
```

Production:

```env
PUBLIC_BASE_URL=https://yourdomain.com
```

The success and cancel URLs sent to PayMongo must be complete URLs.

## 4. Restart the Server

```bash
npm run dev
```

## 5. Test Donation Checkout

1. Open `/support`.
2. Fill out the donation form.
3. Click **Proceed to PayMongo**.
4. The browser should redirect to PayMongo Hosted Checkout.
5. Complete a test payment.
6. Check **Admin > Donations**.

## 6. Common Errors

### `PayMongo is not configured`

`PAYMONGO_SECRET_KEY` is empty.

### `must be a secret key`

You used a public key that starts with `pk_`. Use a secret key that starts with `sk_`.

### `Unauthorized`

The secret key is wrong, copied incorrectly, or from the wrong PayMongo account.

### `Invalid request`

Check:

- amount is at least PHP 20
- `PAYMONGO_PAYMENT_METHODS` uses valid methods
- `PUBLIC_BASE_URL` is a full URL
- server was restarted after `.env` changes

### Payment method error

Use only:

```env
PAYMONGO_PAYMENT_METHODS=card
```

Then enable more methods in PayMongo Dashboard after account activation.

## 7. Local Webhook Testing

PayMongo cannot call `localhost` directly. Use ngrok:

```bash
ngrok http 3000
```

Set:

```env
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

In PayMongo Dashboard, create webhook URL:

```text
https://your-ngrok-url.ngrok-free.app/webhooks/paymongo
```

Subscribe to:

```text
checkout_session.payment.paid
```

Copy the webhook secret:

```env
PAYMONGO_WEBHOOK_SECRET=your_webhook_secret
PAYMONGO_WEBHOOK_MODE=test
```

Restart the server.

## 8. Production PayMongo Checklist

- Use `sk_live_...`
- Set `PAYMONGO_WEBHOOK_MODE=live`
- Set `PUBLIC_BASE_URL=https://yourdomain.com`
- Use HTTPS
- Configure webhook URL as `https://yourdomain.com/webhooks/paymongo`
- Complete PayMongo business verification
- Test one small live donation before public launch

