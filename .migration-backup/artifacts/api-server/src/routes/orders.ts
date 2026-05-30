import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  CreateOrderBody,
  UpdateOrderParams,
  UpdateOrderBody,
  DeleteOrderParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/orders/stats", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.created_at));

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const total_revenue = orders.reduce((sum, o) => sum + Number(o.price), 0);
    const total_orders = orders.length;
    const todayOrders = orders.filter((o) => new Date(o.created_at) >= todayStart);
    const orders_today = todayOrders.length;
    const revenue_today = todayOrders.reduce((sum, o) => sum + Number(o.price), 0);

    const byType: Record<string, { revenue: number; count: number }> = {};
    for (const o of orders) {
      if (!byType[o.product_type]) byType[o.product_type] = { revenue: 0, count: 0 };
      byType[o.product_type].revenue += Number(o.price);
      byType[o.product_type].count += 1;
    }
    const revenue_by_type = Object.entries(byType).map(([type, d]) => ({
      type,
      revenue: d.revenue,
      count: d.count,
    }));

    const recent_orders = orders.slice(0, 10).map((o) => ({
      ...o,
      price: Number(o.price),
    }));

    res.json({
      total_revenue,
      total_orders,
      orders_today,
      revenue_today,
      revenue_by_type,
      recent_orders,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.created_at));
    res.json(orders.map((o) => ({ ...o, price: Number(o.price) })));
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { stripe_session_id, product_name, product_type, price, customer_email, status, promo_code } = parsed.data;
    const [order] = await db
      .insert(ordersTable)
      .values({
        stripe_session_id: stripe_session_id ?? null,
        product_name,
        product_type,
        price: String(price),
        customer_email,
        status: status ?? "completed",
        promo_code: promo_code ?? null,
      })
      .returning();
    res.status(201).json({ ...order, price: Number(order.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateOrderParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const bodyParsed = UpdateOrderBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const updates: Partial<typeof ordersTable.$inferInsert> = {};
    if (bodyParsed.data.status !== undefined) updates.status = bodyParsed.data.status;
    if (bodyParsed.data.customer_email !== undefined) updates.customer_email = bodyParsed.data.customer_email;

    const [order] = await db
      .update(ordersTable)
      .set(updates)
      .where(eq(ordersTable.id, paramsParsed.data.id))
      .returning();

    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...order, price: Number(order.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const parsed = DeleteOrderParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(ordersTable).where(eq(ordersTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
