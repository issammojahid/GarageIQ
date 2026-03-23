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
    return res.json(records);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch maintenance records" });
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
    return res.status(201).json(record);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create maintenance record" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [record] = await db.select().from(maintenanceTable).where(eq(maintenanceTable.id, id));
    if (!record) return res.status(404).json({ error: "Maintenance record not found" });
    return res.json(record);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch maintenance record" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { type, date, mileage, cost, notes, nextDueDate, nextDueMileage } = req.body;
    const [record] = await db.update(maintenanceTable)
      .set({ type, date, mileage, cost, notes, nextDueDate, nextDueMileage })
      .where(eq(maintenanceTable.id, id))
      .returning();
    if (!record) return res.status(404).json({ error: "Maintenance record not found" });
    return res.json(record);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update maintenance record" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(maintenanceTable).where(eq(maintenanceTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete maintenance record" });
  }
});

export default router;
