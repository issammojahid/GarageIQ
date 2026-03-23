import { Router, type IRouter } from "express";
import { db, maintenanceTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
    if (vehicleId) {
      const records = await db.select().from(maintenanceTable)
        .where(eq(maintenanceTable.vehicleId, vehicleId))
        .orderBy(maintenanceTable.date);
      return res.json(records);
    }
    const records = await db.select().from(maintenanceTable).orderBy(maintenanceTable.date);
    res.json(records);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch maintenance records" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { vehicleId, type, date, mileage, notes, nextDueDate, nextDueMileage, cost } = req.body;
    if (!vehicleId || !type || !date || mileage === undefined) {
      return res.status(400).json({ error: "vehicleId, type, date, mileage required" });
    }
    const [record] = await db.insert(maintenanceTable).values({
      vehicleId, type, date, mileage, notes, nextDueDate, nextDueMileage, cost,
    }).returning();
    res.status(201).json(record);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create maintenance record" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(maintenanceTable).where(eq(maintenanceTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete maintenance record" });
  }
});

export default router;
