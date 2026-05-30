import { Router } from "express";
import { db, adminSettingsTable } from "@workspace/db";

const router = Router();

router.get("/settings", async (req, res) => {
  try {
    const rows = await db.select().from(adminSettingsTable);
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    res.json(map);
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const body = req.body as Record<string, string>;
    if (typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    for (const [key, value] of Object.entries(body)) {
      if (typeof key === "string" && typeof value === "string") {
        await db
          .insert(adminSettingsTable)
          .values({ key, value })
          .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value, updated_at: new Date() } });
      }
    }
    res.json({ success: true, message: "Settings saved" });
  } catch (err) {
    req.log.error({ err }, "Failed to save settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
