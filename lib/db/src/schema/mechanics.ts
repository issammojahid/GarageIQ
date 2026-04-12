import { pgTable, serial, text, real, boolean, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mechanicsTable = pgTable("mechanics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  specialties: json("specialties").$type<string[]>().notNull().default([]),
  description: text("description"),
  workingHours: text("working_hours"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  editCodeHash: text("edit_code_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMechanicSchema = createInsertSchema(mechanicsTable).omit({
  id: true,
  isActive: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
});
export type InsertMechanic = z.infer<typeof insertMechanicSchema>;
export type Mechanic = typeof mechanicsTable.$inferSelect;
