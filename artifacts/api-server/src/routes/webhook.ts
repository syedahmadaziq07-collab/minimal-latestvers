import { Router } from "express";
import express from "express";
import Stripe from "stripe";
import { Resend } from "resend";
import { db, ordersTable } from "@workspace/db";

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

async function fetchWallpaperFromSupabase(wallpaperId: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/wallpapers?id=eq.${encodeURIComponent(wallpaperId)}&select=name,drive_url`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json() as { name: string; drive_url: string | null }[];
  return rows[0] ?? null;
}

function buildEmailHtml(wallpaperName: string, driveUrl: string): string {
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
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:13px;letter-spacing:4px;color:#1A1A1A;text-transform:uppercase;">WALLPAPER.MINIMAL</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:36px;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;" />
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:32px;font-weight:400;font-style:italic;color:#1A1A1A;line-height:1.2;">Your wallpaper is ready.</h1>
            </td>
          </tr>

          <!-- Wallpaper name -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;letter-spacing:2px;color:#9E8E78;text-transform:uppercase;">${wallpaperName}</p>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <p style="margin:0;font-size:15px;color:#555;line-height:1.7;max-width:380px;">
                Thank you for your purchase. Your wallpaper is waiting for you — tap the button below to download it.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${driveUrl}" target="_blank"
                style="display:inline-block;padding:16px 40px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                DOWNLOAD WALLPAPER
              </a>
            </td>
          </tr>

          <!-- Reassurance -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:12px;color:#9E8E78;letter-spacing:1px;">
                This link will always be available — save it for later.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="margin:0;font-size:11px;color:#B0A898;letter-spacing:1px;">
                © WALLPAPER.MINIMAL &nbsp;·&nbsp; Dress your screen, softly.
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

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (!webhookSecret || !sig) {
        throw new Error("Missing webhook secret or signature");
      }
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      req.log?.warn({ err }, "Webhook signature verification failed");
      res.status(400).json({ error: `Webhook error: ${err.message}` });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      const wallpaperId = session.metadata?.wallpaper_id ?? "";
      const wallpaperName =
        session.metadata?.wallpaper_name ?? "Your wallpaper";
      const productType = session.metadata?.product_type ?? "single";
      const amountTotal = (session.amount_total ?? 0) / 100;

      try {
        await db.insert(ordersTable).values({
          stripe_session_id: session.id,
          product_name: wallpaperName,
          product_type: productType,
          price: String(amountTotal),
          customer_email: customerEmail ?? "unknown",
          status: "completed",
          promo_code: null,
        });
      } catch (dbErr) {
        req.log?.error({ dbErr }, "Failed to save order to DB");
      }

      if (customerEmail && wallpaperId) {
        try {
          const wallpaper = await fetchWallpaperFromSupabase(wallpaperId);
          const driveUrl = wallpaper?.drive_url ?? null;
          const name = wallpaper?.name ?? wallpaperName;

          if (driveUrl) {
            const resend = getResend();
            const fromEmail =
              process.env.RESEND_FROM_EMAIL ??
              "WALLPAPER.MINIMAL <noreply@wallpaper.minimal>";

            await resend.emails.send({
              from: fromEmail,
              to: customerEmail,
              subject: "Your wallpaper is ready! — WALLPAPER.MINIMAL",
              html: buildEmailHtml(name, driveUrl),
            });
            req.log?.info({ customerEmail }, "Download email sent");
          } else {
            req.log?.warn(
              { wallpaperId },
              "No drive_url found for wallpaper — email not sent"
            );
          }
        } catch (emailErr) {
          req.log?.error({ emailErr }, "Failed to send download email");
        }
      }
    }

    res.json({ received: true });
  }
);

export default router;
