const crypto = require('crypto');

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function getPaymentMethods() {
  return String(process.env.PAYMONGO_PAYMENT_METHODS || 'card,gcash,qrph')
    .split(',')
    .map((method) => method.trim())
    .filter(Boolean);
}

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

async function createDonationCheckout(req, donation) {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PayMongo is not configured. Add PAYMONGO_SECRET_KEY to .env.');
  }
  if (!secretKey.startsWith('sk_')) {
    throw new Error('PAYMONGO_SECRET_KEY must be a secret key that starts with sk_test_ or sk_live_. Do not use a public pk_ key.');
  }

  const amountInCentavos = Math.round(Number(donation.amount) * 100);
  const baseUrl = getBaseUrl(req);
  const paymentMethods = getPaymentMethods();
  if (!paymentMethods.length) {
    throw new Error('PAYMONGO_PAYMENT_METHODS must include at least one method, for example card.');
  }

  const response = await fetch('https://api.paymongo.com/v2/checkout_sessions', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              name: 'Donation to Mary Mother of Mercy Home',
              amount: amountInCentavos,
              currency: 'PHP',
              quantity: 1
            }
          ],
          payment_method_types: paymentMethods,
          description: 'Online donation for Mary Mother of Mercy Home Foundation',
          success_url: `${baseUrl}/donation/success?ref=${encodeURIComponent(donation.reference_number)}`,
          cancel_url: `${baseUrl}/donation/cancel?ref=${encodeURIComponent(donation.reference_number)}`,
          reference_number: donation.reference_number,
          send_email_receipt: asBoolean(process.env.PAYMONGO_SEND_EMAIL_RECEIPT, true),
          pass_on_fees: asBoolean(process.env.PAYMONGO_PASS_ON_FEES, false),
          billing: {
            name: donation.donor_name,
            email: donation.donor_email,
            phone: donation.donor_phone || undefined
          },
          metadata: {
            reference_number: donation.reference_number,
            source: 'mary_mother_website'
          }
        }
      }
    })
  });

  const result = await response.json();
  if (!response.ok) {
    const firstError = result.errors?.[0];
    const detail = firstError?.detail || firstError?.code || result.message || 'PayMongo checkout request failed.';
    throw new Error(`PayMongo checkout failed: ${detail}`);
  }

  const session = result.data;
  const checkoutUrl = session?.attributes?.checkout_url || session?.attributes?.url;
  if (!checkoutUrl) {
    throw new Error('PayMongo did not return a checkout URL.');
  }

  return {
    checkoutSessionId: session.id,
    checkoutUrl
  };
}

function parsePaymongoSignature(headerValue) {
  return String(headerValue || '')
    .split(',')
    .map((part) => part.trim().split('='))
    .reduce((parsed, [key, value]) => {
      if (key) parsed[key] = value || '';
      return parsed;
    }, {});
}

function safeCompareHex(actualHex, expectedHex) {
  if (!actualHex || !expectedHex) return false;
  const actual = Buffer.from(actualHex, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function verifyPaymongoWebhook(req) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!webhookSecret) return true;

  const signature = parsePaymongoSignature(req.get('paymongo-signature'));
  if (!signature.t) return false;

  const mode = process.env.PAYMONGO_WEBHOOK_MODE === 'live' ? 'li' : 'te';
  const expectedSignature = signature[mode];
  const signedPayload = `${signature.t}.${req.rawBody || JSON.stringify(req.body)}`;
  const computed = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('hex');

  return safeCompareHex(computed, expectedSignature);
}

module.exports = {
  createDonationCheckout,
  verifyPaymongoWebhook
};
