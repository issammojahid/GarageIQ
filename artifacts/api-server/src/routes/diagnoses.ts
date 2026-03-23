import { Router, type IRouter } from "express";
import { db, diagnosesTable, vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
    if (vehicleId) {
      const results = await db.select().from(diagnosesTable)
        .where(eq(diagnosesTable.vehicleId, vehicleId))
        .orderBy(diagnosesTable.createdAt);
      return res.json(results);
    }
    const results = await db.select().from(diagnosesTable).orderBy(diagnosesTable.createdAt);
    return res.json(results);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch diagnoses" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { vehicleId, symptoms, systems, errorCodes } = req.body;
    if (!vehicleId || !symptoms || !systems) {
      return res.status(400).json({ error: "vehicleId, symptoms, systems required" });
    }

    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, vehicleId));
    const vehicleContext = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.mileage} km)`
      : `Vehicle ID: ${vehicleId}`;

    const prompt = `You are an expert automotive mechanic. Diagnose the following car problem and provide a detailed analysis.

Vehicle: ${vehicleContext}
Symptoms: ${symptoms}
Affected Systems: ${systems.join(", ")}
${errorCodes ? `OBD-II Error Codes: ${errorCodes}` : ""}

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Brief one-sentence summary of the likely issue",
  "issues": ["Issue 1", "Issue 2"],
  "severity": "low|medium|high|critical",
  "repairSteps": ["Step 1", "Step 2", "Step 3"],
  "estimatedCostMin": 50,
  "estimatedCostMax": 300,
  "diyFriendly": true,
  "urgency": "Can wait / Should fix soon / Fix immediately"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    type DiagnosisResult = {
      summary: string;
      issues: string[];
      severity: string;
      repairSteps: string[];
      estimatedCostMin: number;
      estimatedCostMax: number;
      diyFriendly: boolean;
      urgency: string;
    };
    let aiResult: DiagnosisResult;
    try {
      aiResult = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as DiagnosisResult;
    } catch {
      aiResult = {
        summary: "Unable to parse diagnosis result",
        issues: ["Unknown issue"],
        severity: "medium",
        repairSteps: ["Please consult a mechanic"],
        estimatedCostMin: 0,
        estimatedCostMax: 0,
        diyFriendly: false,
        urgency: "See a mechanic",
      };
    }

    const [diagnosis] = await db.insert(diagnosesTable).values({
      vehicleId,
      symptoms,
      systems,
      errorCodes: errorCodes || null,
      result: aiResult,
    }).returning();

    return res.status(201).json(diagnosis);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create diagnosis" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [diagnosis] = await db.select().from(diagnosesTable).where(eq(diagnosesTable.id, id));
    if (!diagnosis) return res.status(404).json({ error: "Diagnosis not found" });
    return res.json(diagnosis);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch diagnosis" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(diagnosesTable).where(eq(diagnosesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete diagnosis" });
  }
});

export default router;
