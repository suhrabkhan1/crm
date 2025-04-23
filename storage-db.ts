import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";
import {
  users, User, InsertUser,
  events, Event, InsertEvent,
  campaigns, Campaign, InsertCampaign,
  segments, Segment, InsertSegment,
  journeys, Journey, InsertJourney,
  funnels, Funnel, InsertFunnel,
  messages,
  organizations, Organization
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async listUsers(organizationId?: number): Promise<User[]> {
    if (organizationId) {
      return db.select().from(users).where(eq(users.organizationId, organizationId));
    }
    return db.select().from(users);
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async createOrganization(name: string, plan: string): Promise<Organization> {
    const [org] = await db.insert(organizations).values({ name, plan }).returning();
    return org;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [createdEvent] = await db.insert(events).values(event).returning();
    return createdEvent;
  }

  async getEvents(filters?: any): Promise<Event[]> {
    // Basic implementation, can be extended with filters
    const query = db.select().from(events).orderBy(desc(events.timestamp)).limit(100);
    
    if (filters?.name) {
      query.where(eq(events.name, filters.name));
    }
    
    return query;
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return db.select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.timestamp));
  }

  async getEventCounts(period?: string): Promise<Record<string, number>> {
    // For now, return simulated data
    // In a real implementation, we would use SQL aggregations
    return {
      "app_open": 125463,
      "login": 98752,
      "product_view": 87654,
      "add_to_cart": 43210,
      "purchase": 12543,
      "share": 5432
    };
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [createdCampaign] = await db.insert(campaigns).values(campaign).returning();
    return createdCampaign;
  }

  async updateCampaignStatus(id: number, status: string): Promise<Campaign> {
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({ status })
      .where(eq(campaigns.id, id))
      .returning();
    
    return updatedCampaign;
  }

  async listCampaigns(filters?: any): Promise<Campaign[]> {
    // Basic implementation, can be extended with filters
    return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }
  
  // Message operations
  async getMessageStats(campaignId?: number): Promise<any> {
    // For now, return simulated data
    // In a real implementation, we would use SQL aggregations
    return {
      totalSent: 125000,
      delivered: 124250,
      opened: 45200,
      clicked: 18760,
      converted: 3250,
      openRate: 36.4,
      clickRate: 15.1,
      conversionRate: 2.6
    };
  }

  async getChannelPerformance(): Promise<any> {
    // For now, return simulated data
    // In a real implementation, we would use SQL aggregations
    return [
      { channel: 'email', sent: 45000, delivered: 44100, opened: 15750, clicked: 6300, converted: 1260 },
      { channel: 'push', sent: 33000, delivered: 32670, opened: 9800, clicked: 4900, converted: 980 },
      { channel: 'in-app', sent: 28000, delivered: 28000, opened: 14000, clicked: 5600, converted: 840 },
      { channel: 'sms', sent: 12000, delivered: 11880, opened: 4200, clicked: 1440, converted: 120 },
      { channel: 'whatsapp', sent: 7000, delivered: 6930, opened: 1400, clicked: 560, converted: 50 }
    ];
  }

  // Segment operations
  async getSegment(id: number): Promise<Segment | undefined> {
    const [segment] = await db.select().from(segments).where(eq(segments.id, id));
    return segment;
  }

  async createSegment(segment: InsertSegment): Promise<Segment> {
    const [createdSegment] = await db.insert(segments).values(segment).returning();
    return createdSegment;
  }

  async listSegments(filters?: any): Promise<Segment[]> {
    return db.select().from(segments).orderBy(desc(segments.createdAt));
  }

  // Journey operations
  async getJourney(id: number): Promise<Journey | undefined> {
    const [journey] = await db.select().from(journeys).where(eq(journeys.id, id));
    return journey;
  }

  async createJourney(journey: InsertJourney): Promise<Journey> {
    const [createdJourney] = await db.insert(journeys).values(journey).returning();
    return createdJourney;
  }

  async updateJourneyStatus(id: number, status: string): Promise<Journey> {
    const [updatedJourney] = await db
      .update(journeys)
      .set({ status })
      .where(eq(journeys.id, id))
      .returning();
    
    return updatedJourney;
  }

  async listJourneys(filters?: any): Promise<Journey[]> {
    return db.select().from(journeys).orderBy(desc(journeys.createdAt));
  }

  // Funnel operations
  async getFunnel(id: number): Promise<Funnel | undefined> {
    const [funnel] = await db.select().from(funnels).where(eq(funnels.id, id));
    return funnel;
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    const [createdFunnel] = await db.insert(funnels).values(funnel).returning();
    return createdFunnel;
  }

  async listFunnels(filters?: any): Promise<Funnel[]> {
    return db.select().from(funnels).orderBy(desc(funnels.createdAt));
  }

  async getFunnelAnalytics(id: number): Promise<any> {
    // For now, return simulated data
    // In a real implementation, we would use SQL aggregations
    const [funnel] = await db.select().from(funnels).where(eq(funnels.id, id));
    
    if (!funnel) {
      return null;
    }
    
    const steps = Array.isArray(funnel.steps) ? funnel.steps : [];
    const analytics = {
      id: funnel.id,
      name: funnel.name,
      steps: steps.map((step: any, index: number) => {
        const value = 100 - (index * (15 + Math.floor(Math.random() * 10)));
        return {
          name: step.name,
          event: step.event,
          value: Math.max(value, 5)
        };
      })
    };
    
    return analytics;
  }

  // Analytics operations
  async getUserStats(period?: string): Promise<any> {
    // For now, return simulated data
    // In a real implementation, we would use SQL aggregations
    return {
      activeUsers: 246329,
      activeCampaigns: 12,
      eventCount: 3782541,
      conversionRate: 3.8,
      averageSessionDuration: 284, // seconds
      newUsers30d: 54289,
      dailyActiveUsers: [
        { date: '2023-04-01', count: 12453 },
        { date: '2023-04-02', count: 11876 },
        { date: '2023-04-03', count: 13021 },
        { date: '2023-04-04', count: 14532 },
        { date: '2023-04-05', count: 15276 },
        { date: '2023-04-06', count: 14987 },
        { date: '2023-04-07', count: 12954 }
      ]
    };
  }

  async getCohortRetention(): Promise<any> {
    // For now, return simulated data
    // In a real implementation, we would use SQL aggregations
    return [
      { 
        cohort: "Jun 22 - Jun 28", 
        users: 4825,
        retention: [100, 62, 41, 28] 
      },
      { 
        cohort: "Jun 15 - Jun 21", 
        users: 5114,
        retention: [100, 58, 39, 25] 
      },
      { 
        cohort: "Jun 8 - Jun 14", 
        users: 4652,
        retention: [100, 60, 36, 24] 
      },
      { 
        cohort: "Jun 1 - Jun 7", 
        users: 5268,
        retention: [100, 64, 43, 30] 
      }
    ];
  }
}