import { Router, type IRouter } from "express";
import { db, fuelLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
    if (vehicleId) {
      const logs = await db.select().from(fuelLogsTable)
        .where(eq(fuelLogsTable.vehicleId, vehicleId))
        .orderBy(fuelLogsTable.date);
      return res.json(logs);
    }
    const logs = await db.select().from(fuelLogsTable).orderBy(fuelLogsTable.date);
    res.json(logs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch fuel logs" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { vehicleId, liters, pricePerLiter, totalCost, odometer, fuelType, date, notes } = req.body;
    if (!vehicleId || !liters || !pricePerLiter || !totalCost || !odometer || !date) {
      return res.status(400).json({ error: "vehicleId, liters, pricePerLiter, totalCost, odometer, date required" });
    }
    const [log] = await db.insert(fuelLogsTable).values({
      vehicleId, liters, pricePerLiter, totalCost, odometer, fuelType, date, notes,
    }).returning();
    res.status(201).json(log);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create fuel log" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(fuelLogsTable).where(eq(fuelLogsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete fuel log" });
  }
});

export default router;
