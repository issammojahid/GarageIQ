import { Router, type IRouter } from "express";
import { db, documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateDocumentBody, UpdateDocumentBody, ListDocumentsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListDocumentsQueryParams.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: query.error.flatten().fieldErrors });
    }
    const { vehicleId } = query.data;
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
    const parsed = CreateDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { vehicleId, type, title, notes, expiryDate } = parsed.data;
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdateDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { type, title, notes, expiryDate } = parsed.data;
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(documentsTable).where(eq(documentsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
