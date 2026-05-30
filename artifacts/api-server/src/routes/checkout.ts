import { Router } from "express";
import Stripe from "stripe";

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not set");
  }
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function getBaseUrl(): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0].trim();
    return `https://${first}`;
  }
  return "http://localhost:80";
}

router.post("/checkout", async (req, res) => {
  try {
    const { name, price, type, wallpaper_id, wallpaper_name } = req.body ?? {};
    if (!name || price == null || !type) {
      res.status(400).json({ error: "Missing required fields: name, price, type" });
      return;
    }
    const baseUrl = getBaseUrl();

    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      res.status(503).json({ error: "Payment not configured" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name,
              description:
                type === "single"
                  ? "Instant digital download — 4K wallpaper"
                  : type === "pack"
                    ? "Wallpaper bundle — instant digital download"
                    : "Full access — all wallpapers + future drops",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/`,
      metadata: {
        wallpaper_id: wallpaper_id ?? "",
        wallpaper_name: wallpaper_name ?? name,
        product_type: type,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Failed to create checkout session");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
