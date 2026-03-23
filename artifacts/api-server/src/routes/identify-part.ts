import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { description, vehicleMake, vehicleModel, vehicleYear } = req.body;
    if (!description) {
      return res.status(400).json({ error: "description required" });
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

    const completion = await openai.chat.completions.create({
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
