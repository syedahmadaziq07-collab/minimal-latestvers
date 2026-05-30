import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  if (!secretKey) {
    return res.status(503).json({ error: 'Payment not configured' });
  }

  const { name, price, type } = req.body ?? {};

  if (!name || !price || !type) {
    return res.status(400).json({ error: 'Missing required fields: name, price, type' });
  }

  const descriptions: Record<string, string> = {
    single: 'Instant digital download — 4K wallpaper',
    pack: 'Wallpaper bundle — instant digital download',
    full_access: 'Full access — all wallpapers + future drops',
  };

  const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' as any });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              description: descriptions[type] ?? name,
            },
            unit_amount: Math.round(Number(price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/success`,
      cancel_url: siteUrl,
    });
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
