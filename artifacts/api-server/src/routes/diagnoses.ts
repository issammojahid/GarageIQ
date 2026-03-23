import { Router, type IRouter } from "express";
import { db, diagnosesTable, vehiclesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateDiagnosisBody, ListDiagnosesQueryParams } from "@workspace/api-zod";

type OpenAIClient = Awaited<typeof import("@workspace/integrations-openai-ai-server")>["openai"];
let _openai: OpenAIClient | null = null;
async function getOpenAI(): Promise<OpenAIClient | null> {
  if (_openai) return _openai;
  try {
    const mod = await import("@workspace/integrations-openai-ai-server");
    _openai = mod.openai;
    return _openai;
  } catch {
    return null;
  }
}

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListDiagnosesQueryParams.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: query.error.flatten().fieldErrors });
    }
    const { vehicleId } = query.data;
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
    const parsed = CreateDiagnosisBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { vehicleId, symptoms, systems, errorCodes } = parsed.data;
    const aiClient = await getOpenAI();
    if (!aiClient) {
      return res.status(503).json({ error: "AI service unavailable. Please configure OpenAI integration." });
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

    const model = process.env.OPENAI_MODEL ?? "gpt-4o";
    const completion = await aiClient.chat.completions.create({
      model,
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    type Severity = "low" | "medium" | "high" | "critical";
    type DiagnosisResult = {
      summary: string;
      issues: string[];
      severity: Severity;
      repairSteps: string[];
      estimatedCostMin: number;
      estimatedCostMax: number;
      diyFriendly: boolean;
      urgency: string;
    };
    const VALID_SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];
    const fallbackResult: DiagnosisResult = {
      summary: "Unable to parse diagnosis result",
      issues: ["Unknown issue"],
      severity: "medium",
      repairSteps: ["Please consult a mechanic"],
      estimatedCostMin: 0,
      estimatedCostMax: 0,
      diyFriendly: false,
      urgency: "See a mechanic",
    };
    let aiResult: DiagnosisResult;
    try {
      const parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as Record<string, unknown>;
      const severity = VALID_SEVERITIES.includes(parsed.severity as Severity)
        ? (parsed.severity as Severity)
        : "medium";
      aiResult = {
        summary: typeof parsed.summary === "string" ? parsed.summary : fallbackResult.summary,
        issues: Array.isArray(parsed.issues) ? (parsed.issues as string[]) : ["Unknown issue"],
        severity,
        repairSteps: Array.isArray(parsed.repairSteps) ? (parsed.repairSteps as string[]) : ["Please consult a mechanic"],
        estimatedCostMin: typeof parsed.estimatedCostMin === "number" ? parsed.estimatedCostMin : 0,
        estimatedCostMax: typeof parsed.estimatedCostMax === "number" ? parsed.estimatedCostMax : 0,
        diyFriendly: typeof parsed.diyFriendly === "boolean" ? parsed.diyFriendly : false,
        urgency: typeof parsed.urgency === "string" ? parsed.urgency : "See a mechanic",
      };
    } catch {
      aiResult = fallbackResult;
    }

    const [diagnosis] = await db.insert(diagnosesTable).values({
      vehicleId,
      symptoms,
      systems,
      errorCodes: errorCodes ?? null,
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(diagnosesTable).where(eq(diagnosesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete diagnosis" });
  }
});

export default router;
