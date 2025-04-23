import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User and auth related tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  organizationId: integer("organization_id"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events and analytics
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  properties: jsonb("properties"),
  platform: text("platform").default("web"), // Added platform: 'ios', 'android', 'huawei', 'web'
  timestamp: timestamp("timestamp").defaultNow(),
});

// Messaging and campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  channel: text("channel").notNull(),
  status: text("status").notNull(),
  content: jsonb("content").notNull(),
  filters: jsonb("filters"),
  segmentId: integer("segment_id"),
  organizationId: integer("organization_id").notNull(),
  createdBy: integer("created_by").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  userId: text("user_id").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull(),
  sent: boolean("sent").default(false),
  delivered: boolean("delivered").default(false),
  opened: boolean("opened").default(false),
  clicked: boolean("clicked").default(false),
  converted: boolean("converted").default(false),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  convertedAt: timestamp("converted_at"),
});

// Segmentation
export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  filters: jsonb("filters").notNull(),
  organizationId: integer("organization_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Journeys
export const journeys = pgTable("journeys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  status: text("status").notNull(),
  organizationId: integer("organization_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Funnels
export const funnels = pgTable("funnels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  organizationId: integer("organization_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  organizationId: true,
  profileImage: true,
});

// Schema for inserting events
export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  userId: true,
  properties: true,
  platform: true,
});

// Schema for inserting campaigns
export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  channel: true,
  status: true,
  content: true,
  filters: true,
  segmentId: true,
  organizationId: true,
  createdBy: true,
  scheduledAt: true,
});

// Schema for inserting segments
export const insertSegmentSchema = createInsertSchema(segments).pick({
  name: true,
  description: true,
  type: true,
  filters: true,
  organizationId: true,
  createdBy: true,
});

// Schema for inserting journeys
export const insertJourneySchema = createInsertSchema(journeys).pick({
  name: true,
  description: true,
  steps: true,
  status: true,
  organizationId: true,
  createdBy: true,
});

// Schema for inserting funnels
export const insertFunnelSchema = createInsertSchema(funnels).pick({
  name: true,
  description: true,
  steps: true,
  organizationId: true,
  createdBy: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;

export type Journey = typeof journeys.$inferSelect;
export type InsertJourney = z.infer<typeof insertJourneySchema>;

export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = z.infer<typeof insertFunnelSchema>;

export type Organization = typeof organizations.$inferSelect;
