import { Router, type IRouter } from "express";
import { db, documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
    if (vehicleId) {
      const docs = await db.select().from(documentsTable)
        .where(eq(documentsTable.vehicleId, vehicleId))
        .orderBy(documentsTable.createdAt);
      return res.json(docs);
    }
    const docs = await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
    return res.json(docs);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { vehicleId, type, title, notes, expiryDate } = req.body;
    if (!vehicleId || !type || !title) {
      return res.status(400).json({ error: "vehicleId, type, title required" });
    }
    const [doc] = await db.insert(documentsTable).values({
      vehicleId, type, title, notes, expiryDate,
    }).returning();
    return res.status(201).json(doc);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create document" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
    if (!doc) return res.status(404).json({ error: "Document not found" });
    return res.json(doc);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch document" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { type, title, notes, expiryDate } = req.body;
    const [doc] = await db.update(documentsTable)
      .set({ type, title, notes, expiryDate })
      .where(eq(documentsTable.id, id))
      .returning();
    if (!doc) return res.status(404).json({ error: "Document not found" });
    return res.json(doc);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update document" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(documentsTable).where(eq(documentsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
