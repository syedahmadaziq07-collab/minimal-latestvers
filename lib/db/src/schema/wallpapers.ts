import { pgTable, text, boolean, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wallpapersTable = pgTable("wallpapers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("4.00"),
  image_url: text("image_url").notNull(),
  featured: boolean("featured").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertWallpaperSchema = createInsertSchema(wallpapersTable).omit({ id: true, created_at: true });
export type InsertWallpaper = z.infer<typeof insertWallpaperSchema>;
export type Wallpaper = typeof wallpapersTable.$inferSelect;

export const newsletterTable = pgTable("newsletter_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterTable.$inferSelect;
