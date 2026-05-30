import { Router } from "express";
import { db, bundlesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  CreateBundleBody,
  UpdateBundleParams,
  UpdateBundleBody,
  DeleteBundleParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/bundles", async (req, res) => {
  try {
    const bundles = await db.select().from(bundlesTable).orderBy(asc(bundlesTable.price));
    res.json(
      bundles.map((b) => ({
        ...b,
        price: Number(b.price),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list bundles");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bundles", async (req, res) => {
  try {
    const parsed = CreateBundleBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { name, description, wallpaper_count, price, popular, active } = parsed.data;
    const [bundle] = await db
      .insert(bundlesTable)
      .values({
        name,
        description,
        wallpaper_count,
        price: String(price),
        popular: popular ?? false,
        active: active ?? true,
      })
      .returning();
    res.status(201).json({ ...bundle, price: Number(bundle.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to create bundle");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bundles/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateBundleParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const bodyParsed = UpdateBundleBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const b = bodyParsed.data;
    const updates: Partial<typeof bundlesTable.$inferInsert> = {};
    if (b.name !== undefined) updates.name = b.name;
    if (b.description !== undefined) updates.description = b.description;
    if (b.wallpaper_count !== undefined) updates.wallpaper_count = b.wallpaper_count;
    if (b.price !== undefined) updates.price = String(b.price);
    if (b.popular !== undefined) updates.popular = b.popular;
    if (b.active !== undefined) updates.active = b.active;

    const [bundle] = await db
      .update(bundlesTable)
      .set(updates)
      .where(eq(bundlesTable.id, paramsParsed.data.id))
      .returning();

    if (!bundle) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...bundle, price: Number(bundle.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to update bundle");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bundles/:id", async (req, res) => {
  try {
    const parsed = DeleteBundleParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(bundlesTable).where(eq(bundlesTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete bundle");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
