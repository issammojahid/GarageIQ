import { Platform } from "react-native";

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

let db: import("expo-sqlite").SQLiteDatabase | null = null;

function getDb(): import("expo-sqlite").SQLiteDatabase {
  if (!db) {
    const SQLite = require("expo-sqlite");
    db = SQLite.openDatabaseSync("garageiq.db");
    db!.execSync(`
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
  }
  return db!;
}

export async function getAllVehicles(): Promise<LocalVehicle[]> {
  if (Platform.OS === "web") return [];
  return getDb().getAllAsync<LocalVehicle>(
    "SELECT * FROM vehicles ORDER BY createdAt ASC"
  );
}

export async function getVehicleById(id: number): Promise<LocalVehicle | null> {
  if (Platform.OS === "web") return null;
  return getDb().getFirstAsync<LocalVehicle>(
    "SELECT * FROM vehicles WHERE id = ?",
    [id]
  );
}

export async function insertVehicle(v: NewVehicle): Promise<LocalVehicle> {
  if (Platform.OS === "web") {
    const now = new Date().toISOString();
    return { id: Date.now(), ...v, licensePlate: v.licensePlate ?? null, color: v.color ?? null, notes: v.notes ?? null, createdAt: now, updatedAt: now };
  }
  const now = new Date().toISOString();
  const result = await getDb().runAsync(
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
  if (Platform.OS === "web") return;
  const now = new Date().toISOString();
  await getDb().runAsync(
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
  if (Platform.OS === "web") return;
  await getDb().runAsync("DELETE FROM vehicles WHERE id = ?", [id]);
}
