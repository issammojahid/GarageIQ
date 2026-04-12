import { Router, type IRouter } from "express";
import { db, mechanicsTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { createHash } from "crypto";
import { CreateMechanicBody, UpdateMechanicBody, DeleteMechanicBody } from "@workspace/api-zod";

const router: IRouter = Router();

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

router.get("/", async (req, res) => {
  try {
    const city = req.query.city as string | undefined;
    let query = db.select({
      id: mechanicsTable.id,
      name: mechanicsTable.name,
      phone: mechanicsTable.phone,
      city: mechanicsTable.city,
      address: mechanicsTable.address,
      specialties: mechanicsTable.specialties,
      description: mechanicsTable.description,
      workingHours: mechanicsTable.workingHours,
      latitude: mechanicsTable.latitude,
      longitude: mechanicsTable.longitude,
      isActive: mechanicsTable.isActive,
      rating: mechanicsTable.rating,
      reviewCount: mechanicsTable.reviewCount,
      createdAt: mechanicsTable.createdAt,
    }).from(mechanicsTable);

    const results = city
      ? await query.where(ilike(mechanicsTable.city, `%${city}%`))
      : await query;

    const active = results.filter((m) => m.isActive);
    return res.json(active);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch mechanics" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateMechanicBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { editCode, ...rest } = parsed.data;
    const [mechanic] = await db.insert(mechanicsTable).values({
      ...rest,
      specialties: rest.specialties ?? [],
      editCodeHash: hashCode(editCode),
    }).returning({
      id: mechanicsTable.id,
      name: mechanicsTable.name,
      phone: mechanicsTable.phone,
      city: mechanicsTable.city,
      address: mechanicsTable.address,
      specialties: mechanicsTable.specialties,
      description: mechanicsTable.description,
      workingHours: mechanicsTable.workingHours,
      latitude: mechanicsTable.latitude,
      longitude: mechanicsTable.longitude,
      isActive: mechanicsTable.isActive,
      rating: mechanicsTable.rating,
      reviewCount: mechanicsTable.reviewCount,
      createdAt: mechanicsTable.createdAt,
    });
    return res.status(201).json(mechanic);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to register mechanic" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [mechanic] = await db.select({
      id: mechanicsTable.id,
      name: mechanicsTable.name,
      phone: mechanicsTable.phone,
      city: mechanicsTable.city,
      address: mechanicsTable.address,
      specialties: mechanicsTable.specialties,
      description: mechanicsTable.description,
      workingHours: mechanicsTable.workingHours,
      latitude: mechanicsTable.latitude,
      longitude: mechanicsTable.longitude,
      isActive: mechanicsTable.isActive,
      rating: mechanicsTable.rating,
      reviewCount: mechanicsTable.reviewCount,
      createdAt: mechanicsTable.createdAt,
    }).from(mechanicsTable).where(eq(mechanicsTable.id, id));
    if (!mechanic) return res.status(404).json({ error: "Mechanic not found" });
    return res.json(mechanic);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch mechanic" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdateMechanicBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { editCode, ...updates } = parsed.data;
    const [existing] = await db.select({ editCodeHash: mechanicsTable.editCodeHash })
      .from(mechanicsTable).where(eq(mechanicsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Mechanic not found" });
    if (existing.editCodeHash !== hashCode(editCode)) {
      return res.status(401).json({ error: "Invalid edit code" });
    }
    const [mechanic] = await db.update(mechanicsTable)
      .set(updates)
      .where(eq(mechanicsTable.id, id))
      .returning({
        id: mechanicsTable.id,
        name: mechanicsTable.name,
        phone: mechanicsTable.phone,
        city: mechanicsTable.city,
        address: mechanicsTable.address,
        specialties: mechanicsTable.specialties,
        description: mechanicsTable.description,
        workingHours: mechanicsTable.workingHours,
        latitude: mechanicsTable.latitude,
        longitude: mechanicsTable.longitude,
        isActive: mechanicsTable.isActive,
        rating: mechanicsTable.rating,
        reviewCount: mechanicsTable.reviewCount,
        createdAt: mechanicsTable.createdAt,
      });
    return res.json(mechanic);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update mechanic" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = DeleteMechanicBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "editCode is required" });
    }
    const [existing] = await db.select({ editCodeHash: mechanicsTable.editCodeHash })
      .from(mechanicsTable).where(eq(mechanicsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Mechanic not found" });
    if (existing.editCodeHash !== hashCode(parsed.data.editCode)) {
      return res.status(401).json({ error: "Invalid edit code" });
    }
    await db.delete(mechanicsTable).where(eq(mechanicsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete mechanic" });
  }
});

export default router;
