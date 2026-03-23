import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";

vi.mock("@workspace/integrations-openai-ai-server", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe("AI routes with mocked OpenAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/identify-part returns 400 for missing description", async () => {
    const res = await request(app)
      .post("/api/identify-part")
      .send({ vehicleMake: "Toyota" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/identify-part returns result when AI responds", async () => {
    const { openai } = await import("@workspace/integrations-openai-ai-server");
    const mockCreate = openai.chat.completions.create as ReturnType<typeof vi.fn>;
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              partName: "Alternator",
              partDescription: "Charges the battery while the engine runs",
              partNumber: "13579",
              function: "Generates electrical current",
              location: "Engine bay, driven by serpentine belt",
              commonIssues: ["Bearing failure", "Diode failure"],
              estimatedCost: "$150 - $400",
              replacementDifficulty: "Moderate",
            }),
          },
        },
      ],
    });

    const res = await request(app)
      .post("/api/identify-part")
      .send({ description: "device that charges the battery" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("partName");
    expect(res.body).toHaveProperty("estimatedCost");
  });

  it("POST /api/identify-part sanitizes malformed AI response", async () => {
    const { openai } = await import("@workspace/integrations-openai-ai-server");
    const mockCreate = openai.chat.completions.create as ReturnType<typeof vi.fn>;
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "not valid json {{{",
          },
        },
      ],
    });

    const res = await request(app)
      .post("/api/identify-part")
      .send({ description: "some part description" });

    expect(res.status).toBe(200);
    expect(res.body.partName).toBe("Unknown Part");
    expect(res.body.partDescription).toBe("Could not identify part");
  });
});
