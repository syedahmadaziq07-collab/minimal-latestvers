import { Router } from "express";
import { db, promoCodesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreatePromoBody,
  UpdatePromoParams,
  UpdatePromoBody,
  DeletePromoParams,
  ValidatePromoBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/promos", async (req, res) => {
  try {
    const promos = await db.select().from(promoCodesTable).orderBy(desc(promoCodesTable.created_at));
    res.json(
      promos.map((p) => ({
        ...p,
        discount_value: Number(p.discount_value),
        expires_at: p.expires_at ? p.expires_at.toISOString() : null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list promos");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/promos/validate", async (req, res) => {
  try {
    const parsed = ValidatePromoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { code, price } = parsed.data;
    const [promo] = await db
      .select()
      .from(promoCodesTable)
      .where(eq(promoCodesTable.code, code.toUpperCase()));

    if (!promo || !promo.active) {
      res.json({ valid: false, final_price: price, message: "Invalid or inactive promo code", discount_type: null, discount_value: null });
      return;
    }
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      res.json({ valid: false, final_price: price, message: "Promo code has expired", discount_type: null, discount_value: null });
      return;
    }
    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
      res.json({ valid: false, final_price: price, message: "Promo code usage limit reached", discount_type: null, discount_value: null });
      return;
    }

    const dv = Number(promo.discount_value);
    let final_price = price;
    if (promo.discount_type === "percent") {
      final_price = price * (1 - dv / 100);
    } else {
      final_price = Math.max(0, price - dv);
    }

    res.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: dv,
      final_price: Math.round(final_price * 100) / 100,
      message: `${promo.discount_type === "percent" ? dv + "% off" : "$" + dv + " off"} applied`,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to validate promo");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/promos", async (req, res) => {
  try {
    const parsed = CreatePromoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { code, discount_type, discount_value, max_uses, active, expires_at } = parsed.data;
    const [promo] = await db
      .insert(promoCodesTable)
      .values({
        code: code.toUpperCase(),
        discount_type,
        discount_value: String(discount_value),
        max_uses: max_uses ?? null,
        active: active ?? true,
        expires_at: expires_at ? new Date(expires_at) : null,
      })
      .returning();
    res.status(201).json({
      ...promo,
      discount_value: Number(promo.discount_value),
      expires_at: promo.expires_at ? promo.expires_at.toISOString() : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create promo");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/promos/:id", async (req, res) => {
  try {
    const paramsParsed = UpdatePromoParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const bodyParsed = UpdatePromoBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const b = bodyParsed.data;
    const updates: Partial<typeof promoCodesTable.$inferInsert> = {};
    if (b.code !== undefined) updates.code = b.code.toUpperCase();
    if (b.discount_type !== undefined) updates.discount_type = b.discount_type;
    if (b.discount_value !== undefined) updates.discount_value = String(b.discount_value);
    if (b.max_uses !== undefined) updates.max_uses = b.max_uses;
    if (b.active !== undefined) updates.active = b.active;
    if (b.expires_at !== undefined) updates.expires_at = b.expires_at ? new Date(b.expires_at) : null;

    const [promo] = await db
      .update(promoCodesTable)
      .set(updates)
      .where(eq(promoCodesTable.id, paramsParsed.data.id))
      .returning();

    if (!promo) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      ...promo,
      discount_value: Number(promo.discount_value),
      expires_at: promo.expires_at ? promo.expires_at.toISOString() : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update promo");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/promos/:id", async (req, res) => {
  try {
    const parsed = DeletePromoParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(promoCodesTable).where(eq(promoCodesTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete promo");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
