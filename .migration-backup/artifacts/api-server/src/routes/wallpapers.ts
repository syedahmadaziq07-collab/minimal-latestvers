import { Router } from "express";
import { db, wallpapersTable, newsletterTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListWallpapersQueryParams,
  CreateWallpaperBody,
  GetWallpaperParams,
  UpdateWallpaperParams,
  UpdateWallpaperBody,
  DeleteWallpaperParams,
  SubscribeNewsletterBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/wallpapers/featured", async (req, res) => {
  try {
    const wallpapers = await db
      .select()
      .from(wallpapersTable)
      .where(eq(wallpapersTable.featured, true))
      .orderBy(desc(wallpapersTable.created_at))
      .limit(10);

    const mapped = wallpapers.map((w) => ({
      ...w,
      price: Number(w.price),
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to get featured wallpapers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallpapers/categories", async (req, res) => {
  try {
    const wallpapers = await db.select().from(wallpapersTable);
    const countMap: Record<string, number> = {};
    for (const w of wallpapers) {
      countMap[w.category] = (countMap[w.category] ?? 0) + 1;
    }
    const categories = Object.entries(countMap).map(([category, count]) => ({
      category,
      count,
    }));
    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to get categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallpapers", async (req, res) => {
  try {
    const parsed = ListWallpapersQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = db.select().from(wallpapersTable).$dynamic();

    if (params.category) {
      query = query.where(eq(wallpapersTable.category, params.category));
    } else if (params.featured !== undefined) {
      query = query.where(eq(wallpapersTable.featured, params.featured));
    }

    const wallpapers = await query.orderBy(desc(wallpapersTable.created_at));
    const mapped = wallpapers.map((w) => ({
      ...w,
      price: Number(w.price),
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list wallpapers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wallpapers", async (req, res) => {
  try {
    const parsed = CreateWallpaperBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { name, category, price, image_url, featured } = parsed.data;
    const [wallpaper] = await db
      .insert(wallpapersTable)
      .values({
        name,
        category,
        price: String(price ?? 4),
        image_url,
        featured: featured ?? false,
      })
      .returning();

    res.status(201).json({ ...wallpaper, price: Number(wallpaper.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to create wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallpapers/:id", async (req, res) => {
  try {
    const parsed = GetWallpaperParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [wallpaper] = await db
      .select()
      .from(wallpapersTable)
      .where(eq(wallpapersTable.id, parsed.data.id));

    if (!wallpaper) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...wallpaper, price: Number(wallpaper.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to get wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/wallpapers/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateWallpaperParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const bodyParsed = UpdateWallpaperBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const updates: Partial<typeof wallpapersTable.$inferInsert> = {};
    const b = bodyParsed.data;
    if (b.name !== undefined) updates.name = b.name;
    if (b.category !== undefined) updates.category = b.category;
    if (b.price !== undefined) updates.price = String(b.price);
    if (b.image_url !== undefined) updates.image_url = b.image_url;
    if (b.featured !== undefined) updates.featured = b.featured;

    const [wallpaper] = await db
      .update(wallpapersTable)
      .set(updates)
      .where(eq(wallpapersTable.id, paramsParsed.data.id))
      .returning();

    if (!wallpaper) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...wallpaper, price: Number(wallpaper.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to update wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/wallpapers/:id", async (req, res) => {
  try {
    const parsed = DeleteWallpaperParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db
      .delete(wallpapersTable)
      .where(eq(wallpapersTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const parsed = SubscribeNewsletterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid email" });
      return;
    }
    await db
      .insert(newsletterTable)
      .values({ email: parsed.data.email })
      .onConflictDoNothing();
    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to subscribe");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
