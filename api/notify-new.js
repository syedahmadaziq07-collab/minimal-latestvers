module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const siteUrl = process.env.SITE_URL || 'https://minimal-latestvers.vercel.app';
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'WALLPAPER.MINIMAL <noreply@wallpaper.minimal>';
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!apiKey || !supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Email service not configured' });
  }

  const { name, image_url, price, is_free } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'Missing wallpaper name' });
  }

  try {
    // 1. Query all customer emails from completed orders
    const ordersRes = await fetch(`${supabaseUrl}/rest/v1/orders?select=customer_email&status=eq.completed`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    // 2. Query emails from free_downloads
    const freeRes = await fetch(`${supabaseUrl}/rest/v1/free_downloads?select=email`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const freeDownloads = freeRes.ok ? await freeRes.json() : [];

    // 3. Query emails from newsletter_subscribers
    const nlRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers?select=email`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const subscribers = nlRes.ok ? await nlRes.json() : [];

    // 4. Deduplicate
    const emailSet = new Set();
    for (const o of orders) if (o.customer_email) emailSet.add(o.customer_email);
    for (const d of freeDownloads) if (d.email) emailSet.add(d.email);
    for (const s of subscribers) if (s.email) emailSet.add(s.email);

    const emails = [...emailSet].filter(Boolean);
    if (emails.length === 0) {
      return res.json({ sent: 0, total: 0 });
    }

    // 5. Build email HTML
    const priceLabel = is_free ? 'FREE' : `$${Number(price || 0).toFixed(2)}`;
    const shopUrl = `${siteUrl}/shop`;
    const imageBlock = image_url
      ? `<tr><td align="center" style="padding-bottom:32px;"><img src="${image_url}" alt="${name}" style="width:100%;max-width:360px;height:auto;border:1px solid #E8E4DF;" /></td></tr>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;padding:48px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E8E4DF;padding:52px 48px;">
        <tr><td align="center" style="padding-bottom:36px;">
          <p style="margin:0;font-size:13px;letter-spacing:4px;color:#1A1A1A;text-transform:uppercase;">WALLPAPER.MINIMAL</p>
        </td></tr>
        <tr><td style="padding-bottom:32px;"><hr style="border:none;border-top:1px solid #E8E4DF;margin:0;" /></td></tr>
        <tr><td align="center" style="padding-bottom:8px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#9E8E78;text-transform:uppercase;">New Drop</p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:32px;font-weight:400;font-style:italic;color:#1A1A1A;line-height:1.2;">${name}</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:20px;color:#9E8E78;">${priceLabel}</p>
        </td></tr>
        ${imageBlock}
        <tr><td align="center" style="padding-bottom:16px;">
          <p style="margin:0;font-size:14px;color:#555;line-height:1.7;max-width:380px;">
            A new wallpaper has just landed — fresh from the studio. Dress your screen, softly.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="${shopUrl}" target="_blank"
            style="display:inline-block;padding:16px 40px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
            VIEW IN SHOP
          </a>
        </td></tr>
        <tr><td style="padding-bottom:28px;"><hr style="border:none;border-top:1px solid #E8E4DF;margin:0;" /></td></tr>
        <tr><td align="center">
          <p style="margin:0;font-size:11px;color:#B0A898;letter-spacing:1px;">
            &copy; WALLPAPER.MINIMAL &nbsp;&middot;&nbsp; Dress your screen, softly.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // 6. Send via Resend batch endpoint
    const batchPayload = emails.map(to => ({
      from,
      to,
      subject: `New Drop — ${name} is here`,
      html,
    }));

    const resendRes = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload),
    });

    const sent = resendRes.ok ? emails.length : 0;

    if (!resendRes.ok) {
      const errBody = await resendRes.text().catch(() => '');
      console.error('Resend batch error:', resendRes.status, errBody);
    }

    return res.json({ sent, total: emails.length });
  } catch (err) {
    const msg = err?.message || 'Unknown error';
    console.error('notify-new error:', msg);
    return res.status(500).json({ error: msg });
  }
};
