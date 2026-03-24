import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("garageiq.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL DEFAULT 0,
    licensePlate TEXT,
    color TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

export interface LocalVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  licensePlate?: string | null;
  color?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewVehicle = Omit<LocalVehicle, "id" | "createdAt" | "updatedAt">;

export async function getAllVehicles(): Promise<LocalVehicle[]> {
  return db.getAllAsync<LocalVehicle>(
    "SELECT * FROM vehicles ORDER BY createdAt ASC"
  );
}

export async function getVehicleById(id: number): Promise<LocalVehicle | null> {
  return db.getFirstAsync<LocalVehicle>(
    "SELECT * FROM vehicles WHERE id = ?",
    [id]
  );
}

export async function insertVehicle(v: NewVehicle): Promise<LocalVehicle> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO vehicles (make, model, year, mileage, licensePlate, color, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      v.make,
      v.model,
      v.year,
      v.mileage,
      v.licensePlate ?? null,
      v.color ?? null,
      v.notes ?? null,
      now,
      now,
    ]
  );
  return {
    id: result.lastInsertRowId,
    ...v,
    licensePlate: v.licensePlate ?? null,
    color: v.color ?? null,
    notes: v.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateVehicle(id: number, v: NewVehicle): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE vehicles
     SET make=?, model=?, year=?, mileage=?, licensePlate=?, color=?, notes=?, updatedAt=?
     WHERE id=?`,
    [
      v.make,
      v.model,
      v.year,
      v.mileage,
      v.licensePlate ?? null,
      v.color ?? null,
      v.notes ?? null,
      now,
      id,
    ]
  );
}

export async function deleteVehicle(id: number): Promise<void> {
  await db.runAsync("DELETE FROM vehicles WHERE id = ?", [id]);
}
