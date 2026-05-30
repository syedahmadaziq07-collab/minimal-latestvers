const Stripe = require('stripe');

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
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name },
          unit_amount: Math.round(Number(price) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${siteUrl}/success`,
      cancel_url: siteUrl,
      metadata: {
        wallpaper_id: wallpaper_id || '',
        wallpaper_name: name,
        product_type: type || 'single'
      }
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
