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

async function createDonationCheckout(req, donation) {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PayMongo is not configured. Add PAYMONGO_SECRET_KEY to .env.');
  }

  const amountInCentavos = Math.round(Number(donation.amount) * 100);
  const baseUrl = getBaseUrl(req);
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
          payment_method_types: getPaymentMethods(),
          success_url: `${baseUrl}/donation/success?ref=${encodeURIComponent(donation.reference_number)}`,
          cancel_url: `${baseUrl}/donation/cancel?ref=${encodeURIComponent(donation.reference_number)}`,
          reference_number: donation.reference_number
        }
      }
    })
  });

  const result = await response.json();
  if (!response.ok) {
    const detail = result.errors?.[0]?.detail || result.errors?.[0]?.code || 'PayMongo checkout request failed.';
    throw new Error(detail);
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
