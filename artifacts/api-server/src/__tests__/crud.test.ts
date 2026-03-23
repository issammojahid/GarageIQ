import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("CRUD: fuel-logs, maintenance, documents", () => {
  let vehicleId: number;
  const createdFuelLogIds: number[] = [];
  const createdMaintenanceIds: number[] = [];
  const createdDocumentIds: number[] = [];

  afterEach(async () => {
    for (const id of createdFuelLogIds.splice(0)) {
      await request(app).delete(`/api/fuel-logs/${id}`);
    }
    for (const id of createdMaintenanceIds.splice(0)) {
      await request(app).delete(`/api/maintenance/${id}`);
    }
    for (const id of createdDocumentIds.splice(0)) {
      await request(app).delete(`/api/documents/${id}`);
    }
    if (vehicleId) {
      await request(app).delete(`/api/vehicles/${vehicleId}`);
      vehicleId = 0;
    }
  });

  async function ensureVehicle() {
    const res = await request(app).post("/api/vehicles").send({
      make: "Test", model: "Car", year: 2022, mileage: 10000,
    });
    expect(res.status).toBe(201);
    vehicleId = res.body.id as number;
    return vehicleId;
  }

  describe("fuel-logs", () => {
    it("creates, reads, updates, and deletes a fuel log", async () => {
      const vid = await ensureVehicle();

      const createRes = await request(app).post("/api/fuel-logs").send({
        vehicleId: vid, liters: 40, pricePerLiter: 1.8, totalCost: 72, odometer: 10500, date: "2025-01-01", fuelType: "gasoline",
      });
      expect(createRes.status).toBe(201);
      const logId = createRes.body.id as number;
      createdFuelLogIds.push(logId);
      expect(createRes.body.liters).toBe(40);

      const listRes = await request(app).get(`/api/fuel-logs?vehicleId=${vid}`);
      expect(listRes.status).toBe(200);
      expect((listRes.body as { id: number }[]).some((l) => l.id === logId)).toBe(true);

      const updateRes = await request(app).put(`/api/fuel-logs/${logId}`).send({ liters: 45 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.liters).toBe(45);

      const deleteRes = await request(app).delete(`/api/fuel-logs/${logId}`);
      expect(deleteRes.status).toBe(204);
      createdFuelLogIds.splice(createdFuelLogIds.indexOf(logId), 1);
    });

    it("returns 400 for empty update body", async () => {
      const vid = await ensureVehicle();
      const createRes = await request(app).post("/api/fuel-logs").send({
        vehicleId: vid, liters: 30, pricePerLiter: 1.9, totalCost: 57, odometer: 11000, date: "2025-02-01", fuelType: "diesel",
      });
      expect(createRes.status).toBe(201);
      const logId = createRes.body.id as number;
      createdFuelLogIds.push(logId);

      const res = await request(app).put(`/api/fuel-logs/${logId}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No fields to update");
    });
  });

  describe("maintenance", () => {
    it("creates, reads, updates, and deletes a maintenance record", async () => {
      const vid = await ensureVehicle();

      const createRes = await request(app).post("/api/maintenance").send({
        vehicleId: vid, type: "Oil Change", date: "2025-03-01", mileage: 12000,
      });
      expect(createRes.status).toBe(201);
      const recId = createRes.body.id as number;
      createdMaintenanceIds.push(recId);
      expect(createRes.body.type).toBe("Oil Change");

      const listRes = await request(app).get(`/api/maintenance?vehicleId=${vid}`);
      expect(listRes.status).toBe(200);
      expect((listRes.body as { id: number }[]).some((r) => r.id === recId)).toBe(true);

      const updateRes = await request(app).put(`/api/maintenance/${recId}`).send({ mileage: 12500 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.mileage).toBe(12500);

      const deleteRes = await request(app).delete(`/api/maintenance/${recId}`);
      expect(deleteRes.status).toBe(204);
      createdMaintenanceIds.splice(createdMaintenanceIds.indexOf(recId), 1);
    });

    it("returns 400 for empty update body", async () => {
      const vid = await ensureVehicle();
      const createRes = await request(app).post("/api/maintenance").send({
        vehicleId: vid, type: "Tire Rotation", date: "2025-04-01", mileage: 13000,
      });
      expect(createRes.status).toBe(201);
      const recId = createRes.body.id as number;
      createdMaintenanceIds.push(recId);

      const res = await request(app).put(`/api/maintenance/${recId}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No fields to update");
    });
  });

  describe("documents", () => {
    it("creates, reads, updates, and deletes a document", async () => {
      const vid = await ensureVehicle();

      const createRes = await request(app).post("/api/documents").send({
        vehicleId: vid, type: "insurance", title: "Car Insurance 2025",
      });
      expect(createRes.status).toBe(201);
      const docId = createRes.body.id as number;
      createdDocumentIds.push(docId);
      expect(createRes.body.title).toBe("Car Insurance 2025");

      const listRes = await request(app).get(`/api/documents?vehicleId=${vid}`);
      expect(listRes.status).toBe(200);
      expect((listRes.body as { id: number }[]).some((d) => d.id === docId)).toBe(true);

      const updateRes = await request(app).put(`/api/documents/${docId}`).send({ title: "Car Insurance 2026" });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe("Car Insurance 2026");

      const deleteRes = await request(app).delete(`/api/documents/${docId}`);
      expect(deleteRes.status).toBe(204);
      createdDocumentIds.splice(createdDocumentIds.indexOf(docId), 1);
    });

    it("returns 400 for empty update body", async () => {
      const vid = await ensureVehicle();
      const createRes = await request(app).post("/api/documents").send({
        vehicleId: vid, type: "warranty", title: "Warranty Card",
      });
      expect(createRes.status).toBe(201);
      const docId = createRes.body.id as number;
      createdDocumentIds.push(docId);

      const res = await request(app).put(`/api/documents/${docId}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No fields to update");
    });
  });
});
