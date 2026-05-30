import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const PRICES: Record<string, number> = {
  'single': 400,
  'starter': 999,
  'essential': 1799,
  'full': 2999,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' as any });

  const { product } = req.body;
  const amount = PRICES[product];

  if (!amount) {
    return res.status(400).json({ error: 'Invalid product' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: product }, unit_amount: amount }, quantity: 1 }],
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
