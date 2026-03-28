import { Router, type IRouter } from "express";
import { db, fuelLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateFuelLogBody, UpdateFuelLogBody, ListFuelLogsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListFuelLogsQueryParams.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: query.error.flatten().fieldErrors });
    }
    const { vehicleId } = query.data;
    if (vehicleId) {
      const logs = await db.select().from(fuelLogsTable)
        .where(eq(fuelLogsTable.vehicleId, vehicleId))
        .orderBy(fuelLogsTable.date);
      return res.json(logs);
    }
    const logs = await db.select().from(fuelLogsTable).orderBy(fuelLogsTable.date);
    return res.json(logs);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch fuel logs" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateFuelLogBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { vehicleId, liters, pricePerLiter, totalCost, odometer, fuelType, date, notes } = parsed.data;
    const [log] = await db.insert(fuelLogsTable).values({
      vehicleId, liters, pricePerLiter, totalCost, odometer, fuelType, date, notes,
    }).returning();
    return res.status(201).json(log);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create fuel log" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [log] = await db.select().from(fuelLogsTable).where(eq(fuelLogsTable.id, id));
    if (!log) return res.status(404).json({ error: "Fuel log not found" });
    return res.json(log);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch fuel log" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdateFuelLogBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const fields = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    const { liters, pricePerLiter, totalCost, odometer, fuelType, date, notes } = parsed.data;
    const [log] = await db.update(fuelLogsTable)
      .set({ liters, pricePerLiter, totalCost, odometer, fuelType, date, notes })
      .where(eq(fuelLogsTable.id, id))
      .returning();
    if (!log) return res.status(404).json({ error: "Fuel log not found" });
    return res.json(log);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update fuel log" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(fuelLogsTable).where(eq(fuelLogsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete fuel log" });
  }
});

export default router;
