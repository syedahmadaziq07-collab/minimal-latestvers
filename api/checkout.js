module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.SITE_URL || 'https://minimal-latestvers.vercel.app';
  if (!secretKey) {
    return res.status(503).json({ error: 'Payment not configured' });
  }
  const { name, price, type, wallpaper_id } = req.body || {};
  if (!name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', name);
    params.append('line_items[0][price_data][unit_amount]', String(Math.round(Number(price) * 100)));
    params.append('line_items[0][quantity]', '1');
    params.append('mode', 'payment');
    params.append('success_url', `${siteUrl}/success`);
    params.append('cancel_url', siteUrl);
    if (wallpaper_id) params.append('metadata[wallpaper_id]', wallpaper_id);
    params.append('metadata[wallpaper_name]', name);
    params.append('metadata[product_type]', type || 'single');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const body = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(body.error?.message || `Stripe API error: ${stripeRes.status}`);
    return res.status(200).json({ url: body.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
