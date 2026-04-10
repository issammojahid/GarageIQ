import { Router, type IRouter } from "express";
import { IdentifyPartBody } from "@workspace/api-zod";

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
    const parsed = IdentifyPartBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    }
    const { description, vehicleMake, vehicleModel, vehicleYear, imageBase64, imageMimeType } = parsed.data;
    const aiClient = await getOpenAI();
    if (!aiClient) {
      return res.status(503).json({ error: "AI service unavailable. Please configure OpenAI integration." });
    }

    const vehicleContext = vehicleMake && vehicleModel
      ? `Vehicle: ${vehicleYear || ""} ${vehicleMake} ${vehicleModel}`
      : "";

    const jsonSchema = `{
  "partName": "Official part name",
  "partDescription": "What this part is",
  "partNumber": "Common part number if known, or 'Varies by manufacturer'",
  "function": "What this part does in the vehicle",
  "location": "Where in the vehicle this part is located",
  "commonIssues": ["Common problem 1", "Common problem 2"],
  "estimatedCost": "$50 - $200",
  "replacementDifficulty": "Easy / Moderate / Difficult / Professional required"
}`;

    const textPrompt = `You are an expert automotive parts specialist. Identify the car part based on the ${imageBase64 ? "image and " : ""}description provided.

${vehicleContext ? vehicleContext + "\n" : ""}Description: ${description}

Respond ONLY with a valid JSON object in this exact format:
${jsonSchema}`;

    const model = process.env.OPENAI_MODEL ?? "gpt-4o";

    type MessageContent = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

    let messageContent: string | MessageContent[];

    if (imageBase64) {
      const mimeType = imageMimeType ?? "image/jpeg";
      messageContent = [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${imageBase64}` },
        },
        {
          type: "text",
          text: textPrompt,
        },
      ];
    } else {
      messageContent = textPrompt;
    }

    const completion = await aiClient.chat.completions.create({
      model,
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: messageContent }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    type PartResult = {
      partName: string;
      partDescription: string;
      partNumber: string;
      function: string;
      location: string;
      commonIssues: string[];
      estimatedCost: string;
      replacementDifficulty: string;
    };
    const fallback: PartResult = {
      partName: "Unknown Part",
      partDescription: "Could not identify part",
      partNumber: "N/A",
      function: "Unknown",
      location: "Unknown",
      commonIssues: ["Unable to determine"],
      estimatedCost: "N/A",
      replacementDifficulty: "Consult a mechanic",
    };
    let result: PartResult;
    try {
      const parsedResult = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as Record<string, unknown>;
      result = {
        partName: typeof parsedResult.partName === "string" ? parsedResult.partName : fallback.partName,
        partDescription: typeof parsedResult.partDescription === "string" ? parsedResult.partDescription : fallback.partDescription,
        partNumber: typeof parsedResult.partNumber === "string" ? parsedResult.partNumber : fallback.partNumber,
        function: typeof parsedResult.function === "string" ? parsedResult.function : fallback.function,
        location: typeof parsedResult.location === "string" ? parsedResult.location : fallback.location,
        commonIssues: Array.isArray(parsedResult.commonIssues) ? (parsedResult.commonIssues as string[]) : fallback.commonIssues,
        estimatedCost: typeof parsedResult.estimatedCost === "string" ? parsedResult.estimatedCost : fallback.estimatedCost,
        replacementDifficulty: typeof parsedResult.replacementDifficulty === "string" ? parsedResult.replacementDifficulty : fallback.replacementDifficulty,
      };
    } catch {
      result = fallback;
    }

    return res.json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to identify part" });
  }
});

export default router;
