import { Router, type IRouter } from "express";

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

router.post("/", async (req, res) => {
  try {
    const { description, vehicleMake, vehicleModel, vehicleYear } = req.body as {
      description?: unknown;
      vehicleMake?: unknown;
      vehicleModel?: unknown;
      vehicleYear?: unknown;
    };
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return res.status(400).json({ error: "description is required and must be a string" });
    }
    const aiClient = await getOpenAI();
    if (!aiClient) {
      return res.status(503).json({ error: "AI service unavailable. Please configure OpenAI integration." });
    }

    const vehicleContext = vehicleMake && vehicleModel
      ? `Vehicle: ${vehicleYear || ""} ${vehicleMake} ${vehicleModel}`
      : "";

    const prompt = `You are an expert automotive parts specialist. Identify the car part based on the description.

${vehicleContext}
Description: ${description}

Respond ONLY with a valid JSON object in this exact format:
{
  "partName": "Official part name",
  "partDescription": "What this part is",
  "partNumber": "Common part number if known, or 'Varies by manufacturer'",
  "function": "What this part does in the vehicle",
  "location": "Where in the vehicle this part is located",
  "commonIssues": ["Common problem 1", "Common problem 2"],
  "estimatedCost": "$50 - $200",
  "replacementDifficulty": "Easy / Moderate / Difficult / Professional required"
}`;

    const completion = await aiClient.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as Record<string, unknown>;
    } catch {
      result = {
        partName: "Unknown Part",
        partDescription: "Could not identify part",
        partNumber: "N/A",
        function: "Unknown",
        location: "Unknown",
        commonIssues: ["Unable to determine"],
        estimatedCost: "N/A",
        replacementDifficulty: "Consult a mechanic",
      };
    }

    return res.json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to identify part" });
  }
});

export default router;
