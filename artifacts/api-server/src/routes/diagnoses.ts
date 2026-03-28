import { Router, type IRouter } from "express";
import { db, diagnosesTable } from "@workspace/db";
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
    const {
      vehicleId,
      symptoms,
      systems,
      errorCodes,
      imageBase64,
      imageMimeType,
      language,
      currency,
      drivingConditions,
      previousIssues,
      vehicleMake: bodyMake,
      vehicleModel: bodyModel,
      vehicleYear: bodyYear,
      vehicleMileage: bodyMileage,
    } = parsed.data;

    const aiClient = await getOpenAI();
    if (!aiClient) {
      return res.status(503).json({ error: "AI service unavailable. Please configure OpenAI integration." });
    }

    const make = bodyMake ?? "Unknown";
    const model = bodyModel ?? "Vehicle";
    const year = bodyYear ?? "";
    const mileage = bodyMileage != null ? `${bodyMileage}` : "N/A";

    const userLanguage = language ?? "English";
    const selectedCurrency = currency ?? "USD";
    const conditions = drivingConditions ?? "Not specified";
    const prevIssues = previousIssues?.trim() || "None";
    const errorSection = errorCodes ? `\n- OBD-II Codes: ${errorCodes}` : "";
    const imageNote = imageBase64
      ? "A photo of the issue has been provided. Analyze the image carefully and factor it into your diagnosis."
      : "";

    const systemPrompt = `You are a professional car mechanic AI.

User input:
- Image: ${imageBase64 ? "(car problem photo provided)" : "(no photo)"}
- Description: ${symptoms}
- Car: ${make} ${model} ${year}
- Language: ${userLanguage}
- Currency: ${selectedCurrency}
- Mileage: ${mileage} km/miles${errorSection}
- Driving conditions: ${conditions}
- Previous issues: ${prevIssues}

${imageNote}
Respond ONLY in the user's selected language (${userLanguage}).

Return your answer ONLY as a valid JSON object with these exact fields:
{
  "problem": "Most likely issue",
  "causes": ["Main cause", "Second cause", "Third cause"],
  "severity": "Low | Medium | High | Dangerous",
  "safeToDrive": { "answer": "Yes | No", "explanation": "short reason" },
  "solution": "Step-by-step fix instructions",
  "estimatedCost": "Realistic range in ${selectedCurrency} (e.g. ${selectedCurrency === "USD" ? "$200–$500" : selectedCurrency === "EUR" ? "€200–€500" : selectedCurrency === "MAD" ? "2000–5000 MAD" : selectedCurrency === "GBP" ? "£150–£400" : "200–500 " + selectedCurrency})",
  "recommendation": "DIY or Mechanic",
  "maintenanceTips": ["tip 1", "tip 2"],
  "confidence": "High | Medium | Low",
  "notes": "Optional: if image is unclear or more context needed, otherwise empty string"
}

Rules:
- Use simple, clear language in ${userLanguage}
- Avoid complex jargon
- Adapt currency to the ${selectedCurrency} symbol
- Include mileage and driving conditions in your analysis
- Suggest maintenance tips if relevant
- Always provide practical and actionable advice
- Return ONLY the JSON object, no markdown, no extra text`;

    const model_name = process.env.OPENAI_MODEL ?? "gpt-4o";

    type ChatMessage = Parameters<typeof aiClient.chat.completions.create>[0]["messages"][0];

    let userMessage: ChatMessage;
    if (imageBase64) {
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMimeType ?? "image/jpeg"};base64,${imageBase64}`,
              detail: "auto",
            },
          },
        ],
      };
    } else {
      userMessage = { role: "user", content: systemPrompt };
    }

    const completion = await aiClient.chat.completions.create({
      model: model_name,
      max_completion_tokens: 8192,
      messages: [userMessage],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    type Severity = "low" | "medium" | "high" | "critical" | "dangerous";
    type SafeToDrive = { answer: "Yes" | "No"; explanation: string };
    type Confidence = "High" | "Medium" | "Low";
    type DiagnosisResult = {
      summary: string;
      issues: string[];
      severity: Severity;
      repairSteps: string[];
      estimatedCostMin: number;
      estimatedCostMax: number;
      estimatedCost?: string;
      diyFriendly: boolean;
      urgency: string;
      safeToDrive?: SafeToDrive;
      confidence?: Confidence;
      maintenanceTips?: string[];
      notes?: string;
    };

    const VALID_SEVERITIES: Severity[] = ["low", "medium", "high", "critical", "dangerous"];
    const VALID_CONFIDENCE: Confidence[] = ["High", "Medium", "Low"];

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
      const raw = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as Record<string, unknown>;

      const rawSeverity = typeof raw.severity === "string" ? raw.severity.toLowerCase() : "";
      const normalizedSeverity = rawSeverity === "dangerous" ? "dangerous"
        : rawSeverity === "high" ? "high"
        : rawSeverity === "medium" ? "medium"
        : rawSeverity === "low" ? "low"
        : "medium";
      const severity: Severity = VALID_SEVERITIES.includes(normalizedSeverity as Severity)
        ? (normalizedSeverity as Severity)
        : "medium";

      const problem = typeof raw.problem === "string" ? raw.problem : "";
      const causes = Array.isArray(raw.causes) ? (raw.causes as string[]) : [];
      const solution = typeof raw.solution === "string" ? raw.solution : "";
      const estimatedCost = typeof raw.estimatedCost === "string" ? raw.estimatedCost : undefined;
      const recommendation = typeof raw.recommendation === "string" ? raw.recommendation : "";
      const diyFriendly = recommendation.toLowerCase().includes("diy");
      const maintenanceTips = Array.isArray(raw.maintenanceTips) ? (raw.maintenanceTips as string[]) : undefined;
      const rawConfidence = typeof raw.confidence === "string" ? raw.confidence : "";
      const confidence: Confidence | undefined = VALID_CONFIDENCE.includes(rawConfidence as Confidence)
        ? (rawConfidence as Confidence)
        : undefined;
      const rawNotes = typeof raw.notes === "string" ? raw.notes.trim() : "";
      const notes = rawNotes && rawNotes.toLowerCase() !== "null" ? rawNotes : undefined;

      let safeToDrive: SafeToDrive | undefined;
      if (raw.safeToDrive && typeof raw.safeToDrive === "object") {
        const std = raw.safeToDrive as Record<string, unknown>;
        const answer = typeof std.answer === "string" && (std.answer === "Yes" || std.answer === "No") ? std.answer : "No";
        const explanation = typeof std.explanation === "string" ? std.explanation : "";
        safeToDrive = { answer, explanation };
      }

      const urgency = safeToDrive?.answer === "No"
        ? "Fix immediately"
        : severity === "high" || severity === "dangerous"
        ? "Should fix soon"
        : severity === "medium"
        ? "Monitor and plan repair"
        : "Can wait until next service";

      aiResult = {
        summary: problem || causes[0] || fallbackResult.summary,
        issues: causes.length > 0 ? causes : ["See solution below"],
        severity,
        repairSteps: solution ? [solution] : ["Please consult a mechanic"],
        estimatedCostMin: 0,
        estimatedCostMax: 0,
        estimatedCost,
        diyFriendly,
        urgency,
        safeToDrive,
        confidence,
        maintenanceTips,
        notes,
      };
    } catch {
      aiResult = fallbackResult;
    }

    const [diagnosis] = await db.insert(diagnosesTable).values({
      vehicleId,
      vehicleMake: make !== "Unknown" ? make : null,
      vehicleModel: model !== "Vehicle" ? model : null,
      vehicleYear: typeof year === "number" ? year : (year ? parseInt(String(year)) : null),
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
