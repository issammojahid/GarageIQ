import { Router, type IRouter } from "express";
import { db, maintenanceTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateMaintenanceBody, UpdateMaintenanceRecordBody, ListMaintenanceQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListMaintenanceQueryParams.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: query.error.flatten().fieldErrors });
    }
    const { vehicleId } = query.data;
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
    const parsed = CreateMaintenanceBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { vehicleId, type, date, mileage, notes, nextDueDate, nextDueMileage, cost } = parsed.data;
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdateMaintenanceRecordBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { type, date, mileage, cost, notes, nextDueDate, nextDueMileage } = parsed.data;
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(maintenanceTable).where(eq(maintenanceTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete maintenance record" });
  }
});

export default router;
