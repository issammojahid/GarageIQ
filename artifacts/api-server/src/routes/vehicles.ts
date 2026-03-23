import { Router, type IRouter } from "express";
import { db, vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateVehicleBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const vehicles = await db.select().from(vehiclesTable).orderBy(vehiclesTable.createdAt);
    return res.json(vehicles);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateVehicleBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { make, model, year, mileage, licensePlate, color, notes } = parsed.data;
    const [vehicle] = await db.insert(vehiclesTable).values({
      make, model, year, mileage, licensePlate, color, notes,
    }).returning();
    return res.status(201).json(vehicle);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create vehicle" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, id));
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    return res.json(vehicle);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { make, model, year, mileage, licensePlate, color, notes } = req.body;
    const [vehicle] = await db.update(vehiclesTable)
      .set({ make, model, year, mileage, licensePlate, color, notes, updatedAt: new Date() })
      .where(eq(vehiclesTable.id, id))
      .returning();
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    return res.json(vehicle);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update vehicle" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete vehicle" });
  }
});

export default router;
