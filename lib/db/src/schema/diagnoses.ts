import { pgTable, serial, text, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vehiclesTable } from "./vehicles";

export const diagnosesTable = pgTable("diagnoses", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehiclesTable.id, { onDelete: "cascade" }),
  symptoms: text("symptoms").notNull(),
  systems: json("systems").$type<string[]>().notNull().default([]),
  errorCodes: text("error_codes"),
  result: json("result").$type<{
    summary: string;
    issues: string[];
    severity: string;
    repairSteps: string[];
    estimatedCostMin: number;
    estimatedCostMax: number;
    diyFriendly: boolean;
    urgency: string;
  }>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDiagnosisSchema = createInsertSchema(diagnosesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertDiagnosis = z.infer<typeof insertDiagnosisSchema>;
export type DiagnosisRecord = typeof diagnosesTable.$inferSelect;
