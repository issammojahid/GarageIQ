import { describe, it, expect, vi, afterEach } from "vitest";
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

describe("E2E flow: create vehicle → diagnose → history", () => {
  let createdVehicleId: number;
  let createdDiagnosisId: number;

  afterEach(async () => {
    if (createdDiagnosisId) {
      await request(app).delete(`/api/diagnoses/${createdDiagnosisId}`);
      createdDiagnosisId = 0;
    }
    if (createdVehicleId) {
      await request(app).delete(`/api/vehicles/${createdVehicleId}`);
      createdVehicleId = 0;
    }
  });

  it("creates a vehicle", async () => {
    const res = await request(app).post("/api/vehicles").send({
      make: "Toyota",
      model: "Camry",
      year: 2020,
      mileage: 50000,
      color: "Silver",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.make).toBe("Toyota");
    expect(res.body.model).toBe("Camry");
    createdVehicleId = res.body.id as number;
  });

  it("reads back the created vehicle", async () => {
    const createRes = await request(app).post("/api/vehicles").send({
      make: "Honda",
      model: "Civic",
      year: 2021,
      mileage: 30000,
    });
    expect(createRes.status).toBe(201);
    createdVehicleId = createRes.body.id as number;

    const getRes = await request(app).get(`/api/vehicles/${createdVehicleId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.make).toBe("Honda");
    expect(getRes.body.model).toBe("Civic");
  });

  it("runs full diagnosis flow: create vehicle → diagnose → appears in history", async () => {
    const { openai } = await import("@workspace/integrations-openai-ai-server");
    const mockCreate = openai.chat.completions.create as ReturnType<typeof vi.fn>;
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: "Possible fuel injector issue",
              issues: ["Dirty fuel injector", "Faulty MAF sensor"],
              severity: "medium",
              repairSteps: ["Clean injectors", "Replace MAF sensor"],
              estimatedCostMin: 100,
              estimatedCostMax: 400,
              diyFriendly: true,
              urgency: "Should fix soon",
            }),
          },
        },
      ],
    });

    const vehicleRes = await request(app).post("/api/vehicles").send({
      make: "Ford",
      model: "Focus",
      year: 2019,
      mileage: 75000,
    });
    expect(vehicleRes.status).toBe(201);
    createdVehicleId = vehicleRes.body.id as number;

    const diagRes = await request(app).post("/api/diagnoses").send({
      vehicleId: createdVehicleId,
      symptoms: "Engine hesitates when accelerating",
      systems: ["engine", "fuel"],
      errorCodes: "P0300",
    });
    expect(diagRes.status).toBe(201);
    expect(diagRes.body).toHaveProperty("id");
    expect(diagRes.body.result.severity).toBe("medium");
    createdDiagnosisId = diagRes.body.id as number;

    const historyRes = await request(app).get(`/api/diagnoses?vehicleId=${createdVehicleId}`);
    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body)).toBe(true);
    const found = (historyRes.body as { id: number }[]).some((d) => d.id === createdDiagnosisId);
    expect(found).toBe(true);
  });
});
