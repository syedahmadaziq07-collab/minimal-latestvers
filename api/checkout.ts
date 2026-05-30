import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" as any });
}

function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:80";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, price, type } = req.body as {
    name: string;
    price: number;
    type: "single" | "pack" | "bundle";
  };

  if (!name || typeof price !== "number" || !type) {
    res.status(400).json({ error: "name, price, and type are required" });
    return;
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    res.status(503).json({ error: "Payment not configured" });
    return;
  }

  const siteUrl = getSiteUrl();

  const description =
    type === "single"
      ? "Instant digital download — 4K resolution wallpaper"
      : type === "pack"
        ? "Wallpaper bundle — instant digital download"
        : "Full collection — all wallpapers + future drops";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name, description },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
