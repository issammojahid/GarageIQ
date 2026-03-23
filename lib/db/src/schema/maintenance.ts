import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const maintenanceTable = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  mileage: integer("mileage").notNull(),
  notes: text("notes"),
  nextDueDate: text("next_due_date"),
  nextDueMileage: integer("next_due_mileage"),
  cost: real("cost"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type MaintenanceRecord = typeof maintenanceTable.$inferSelect;
