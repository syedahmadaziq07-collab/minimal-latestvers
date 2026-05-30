const Stripe = require('stripe');

async function supabaseFetch(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...options.headers },
    ...options,
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function buildEmailHtml(wallpaperName, driveUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your wallpaper is ready!</title>
</head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E8E4DF;padding:52px 48px;">
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:13px;letter-spacing:4px;color:#1A1A1A;text-transform:uppercase;">WALLPAPER.MINIMAL</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:36px;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:32px;font-weight:400;font-style:italic;color:#1A1A1A;line-height:1.2;">Your wallpaper is ready.</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;letter-spacing:2px;color:#9E8E78;text-transform:uppercase;">${wallpaperName}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <p style="margin:0;font-size:15px;color:#555;line-height:1.7;max-width:380px;">
                Thank you for your purchase. Your wallpaper is waiting for you — tap the button below to download it.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${driveUrl}" target="_blank"
                style="display:inline-block;padding:16px 40px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                DOWNLOAD WALLPAPER
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:12px;color:#9E8E78;letter-spacing:1px;">
                This link will always be available — save it for later.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;" />
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;font-size:11px;color:#B0A898;letter-spacing:1px;">
                &copy; WALLPAPER.MINIMAL &nbsp;&middot;&nbsp; Dress your screen, softly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.RESEND_FROM_EMAIL || 'WALLPAPER.MINIMAL <noreply@wallpaper.minimal>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return res.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  try {
    const stripe = new Stripe(secretKey);
    event = stripe.webhooks.constructEvent(
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      sig,
      webhookSecret
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email || session.customer_email || null;
    const wallpaperId = session.metadata?.wallpaper_id || '';
    const wallpaperName = session.metadata?.wallpaper_name || 'Your wallpaper';
    const amountTotal = (session.amount_total || 0) / 100;

    // Save order to Supabase
    try {
      await supabaseFetch('orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          customer_email: customerEmail || 'unknown',
          product: wallpaperName,
          amount: amountTotal,
          status: 'completed',
        }),
      });
    } catch (dbErr) {
      console.error('Failed to save order:', dbErr);
    }

    // Send email with download link
    if (customerEmail && wallpaperId) {
      try {
        const rows = await supabaseFetch(
          `wallpapers?id=eq.${encodeURIComponent(wallpaperId)}&select=name,drive_url`
        );
        const wallpaper = rows && rows[0] ? rows[0] : null;
        const driveUrl = wallpaper?.drive_url || null;
        const name = wallpaper?.name || wallpaperName;

        if (driveUrl) {
          await sendEmail(
            customerEmail,
            'Your wallpaper is ready! \u2014 WALLPAPER.MINIMAL',
            buildEmailHtml(name, driveUrl)
          );
        }
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }
    }
  }

  res.json({ received: true });
};
