import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("API smoke tests", () => {
  it("GET /api/healthz returns 200", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  it("GET /api/vehicles returns 200 with array", async () => {
    const res = await request(app).get("/api/vehicles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/vehicles with missing fields returns 400", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .send({ make: "Toyota" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/vehicles with invalid body returns 400", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .send({ make: 123, model: "Camry", year: "not-a-year", mileage: 0 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/identify-part with missing description returns 400", async () => {
    const res = await request(app)
      .post("/api/identify-part")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/diagnoses with invalid body returns 400", async () => {
    const res = await request(app)
      .post("/api/diagnoses")
      .send({ symptoms: "engine knock" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("GET /api/vehicles/:id with non-numeric id returns 400", async () => {
    const res = await request(app).get("/api/vehicles/abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid ID");
  });

  it("GET /api/vehicles/:id with non-existent id returns 404", async () => {
    const res = await request(app).get("/api/vehicles/999999");
    expect(res.status).toBe(404);
  });
});
