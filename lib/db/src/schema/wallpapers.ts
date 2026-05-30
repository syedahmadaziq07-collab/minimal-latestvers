import { pgTable, text, boolean, numeric, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wallpapersTable = pgTable("wallpapers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  style: text("style"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("4.00"),
  image_url: text("image_url").notNull(),
  drive_url: text("drive_url"),
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

export const ordersTable = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripe_session_id: text("stripe_session_id"),
  product_name: text("product_name").notNull(),
  product_type: text("product_type").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  customer_email: text("customer_email").notNull(),
  status: text("status").notNull().default("completed"),
  promo_code: text("promo_code"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, created_at: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const bundlesTable = pgTable("bundles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  wallpaper_count: integer("wallpaper_count").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertBundleSchema = createInsertSchema(bundlesTable).omit({ id: true, created_at: true });
export type InsertBundle = z.infer<typeof insertBundleSchema>;
export type Bundle = typeof bundlesTable.$inferSelect;

export const promoCodesTable = pgTable("promo_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  discount_type: text("discount_type").notNull(),
  discount_value: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  max_uses: integer("max_uses"),
  uses_count: integer("uses_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromoSchema = createInsertSchema(promoCodesTable).omit({ id: true, created_at: true, uses_count: true });
export type InsertPromo = z.infer<typeof insertPromoSchema>;
export type PromoCode = typeof promoCodesTable.$inferSelect;

export const adminSettingsTable = pgTable("admin_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type AdminSetting = typeof adminSettingsTable.$inferSelect;
