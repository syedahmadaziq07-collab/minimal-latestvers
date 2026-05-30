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

type ProductType = "single" | "pack" | "bundle";

interface CatalogEntry {
  unitAmountCents: number;
  description: string;
}

const SINGLE_WALLPAPER_PRICE_CENTS = 400; // $4.00

const BUNDLE_CATALOG: Record<string, CatalogEntry> = {
  "Starter Pack": {
    unitAmountCents: 999,
    description: "10 curated aesthetic wallpapers — instant digital download",
  },
  "Essential Set": {
    unitAmountCents: 1799,
    description: "18 premium aesthetic wallpapers — 4K & OLED optimized",
  },
  "Full Collection": {
    unitAmountCents: 2999,
    description: "Every wallpaper + all future drops — iPhone, iPad & Mac sizes",
  },
};

function resolvePrice(
  type: ProductType,
  name: string
): { unitAmountCents: number; description: string } | null {
  if (type === "single") {
    return {
      unitAmountCents: SINGLE_WALLPAPER_PRICE_CENTS,
      description: "Instant digital download — 4K resolution wallpaper",
    };
  }
  const entry = BUNDLE_CATALOG[name];
  if (!entry) return null;
  return entry;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, type } = req.body as { name?: string; type?: string };

  if (!name || !type) {
    res.status(400).json({ error: "name and type are required" });
    return;
  }

  if (!["single", "pack", "bundle"].includes(type)) {
    res.status(400).json({ error: "Invalid product type" });
    return;
  }

  const resolved = resolvePrice(type as ProductType, name);
  if (!resolved) {
    res.status(400).json({ error: `Unknown product: ${name}` });
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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name,
              description: resolved.description,
            },
            unit_amount: resolved.unitAmountCents,
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
