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

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(organizationId?: number): Promise<User[]>;

  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(name: string, plan: string): Promise<Organization>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(filters?: any): Promise<Event[]>;
  getEventsByUser(userId: string): Promise<Event[]>;
  getEventCounts(period?: string): Promise<Record<string, number>>;

  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignStatus(id: number, status: string): Promise<Campaign>;
  listCampaigns(filters?: any): Promise<Campaign[]>;
  
  // Message operations
  getMessageStats(campaignId?: number): Promise<any>;
  getChannelPerformance(): Promise<any>;

  // Segment operations
  getSegment(id: number): Promise<Segment | undefined>;
  createSegment(segment: InsertSegment): Promise<Segment>;
  listSegments(filters?: any): Promise<Segment[]>;

  // Journey operations
  getJourney(id: number): Promise<Journey | undefined>;
  createJourney(journey: InsertJourney): Promise<Journey>;
  updateJourneyStatus(id: number, status: string): Promise<Journey>;
  listJourneys(filters?: any): Promise<Journey[]>;

  // Funnel operations
  getFunnel(id: number): Promise<Funnel | undefined>;
  createFunnel(funnel: InsertFunnel): Promise<Funnel>;
  listFunnels(filters?: any): Promise<Funnel[]>;
  getFunnelAnalytics(id: number): Promise<any>;

  // Analytics operations
  getUserStats(period?: string): Promise<any>;
  getCohortRetention(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Event[];
  private campaigns: Map<number, Campaign>;
  private segments: Map<number, Segment>;
  private journeys: Map<number, Journey>;
  private funnels: Map<number, Funnel>;
  private messages: any[];
  private organizations: Map<number, Organization>;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private campaignIdCounter: number;
  private segmentIdCounter: number;
  private journeyIdCounter: number;
  private funnelIdCounter: number;
  private orgIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = [];
    this.campaigns = new Map();
    this.segments = new Map();
    this.journeys = new Map();
    this.funnels = new Map();
    this.messages = [];
    this.organizations = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.campaignIdCounter = 1;
    this.segmentIdCounter = 1;
    this.journeyIdCounter = 1;
    this.funnelIdCounter = 1;
    this.orgIdCounter = 1;

    // Initialize with some demo data
    this.initializeDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async listUsers(organizationId?: number): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    if (organizationId !== undefined) {
      return allUsers.filter(user => user.organizationId === organizationId);
    }
    return allUsers;
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(name: string, plan: string): Promise<Organization> {
    const id = this.orgIdCounter++;
    const newOrg: Organization = { id, name, plan, createdAt: new Date() };
    this.organizations.set(id, newOrg);
    return newOrg;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const newEvent: Event = { ...event, id, timestamp: new Date() };
    this.events.push(newEvent);
    return newEvent;
  }

  async getEvents(filters?: any): Promise<Event[]> {
    if (!filters) return this.events;
    
    return this.events.filter(event => {
      if (filters.name && event.name !== filters.name) return false;
      if (filters.userId && event.userId !== filters.userId) return false;
      return true;
    });
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return this.events.filter(event => event.userId === userId);
  }

  async getEventCounts(period?: string): Promise<Record<string, number>> {
    const eventCounts: Record<string, number> = {};
    this.events.forEach(event => {
      if (!eventCounts[event.name]) {
        eventCounts[event.name] = 0;
      }
      eventCounts[event.name]++;
    });
    return eventCounts;
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const newCampaign: Campaign = { ...campaign, id, createdAt: new Date() };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaignStatus(id: number, status: string): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    
    const updatedCampaign = { ...campaign, status };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async listCampaigns(filters?: any): Promise<Campaign[]> {
    const allCampaigns = Array.from(this.campaigns.values());
    
    if (!filters) return allCampaigns;
    
    return allCampaigns.filter(campaign => {
      if (filters.status && campaign.status !== filters.status) return false;
      if (filters.channel && campaign.channel !== filters.channel) return false;
      if (filters.organizationId && campaign.organizationId !== filters.organizationId) return false;
      return true;
    });
  }

  // Message operations
  async getMessageStats(campaignId?: number): Promise<any> {
    // Mock stats for message performance
    return {
      totalSent: 80473,
      delivered: 78752,
      opened: 32408,
      clicked: 6842,
      converted: 2142,
      openRate: 41.2,
      clickRate: 8.7,
      conversionRate: 2.7
    };
  }

  async getChannelPerformance(): Promise<any> {
    // Mock data for channel performance
    return {
      push: { openRate: 18, clickRate: 4.8 },
      email: { openRate: 62, clickRate: 8.2 },
      sms: { openRate: 98, clickRate: 7.5 },
      inApp: { openRate: 52, clickRate: 3.2 },
      whatsapp: { openRate: 94, clickRate: 12.8 }
    };
  }

  // Segment operations
  async getSegment(id: number): Promise<Segment | undefined> {
    return this.segments.get(id);
  }

  async createSegment(segment: InsertSegment): Promise<Segment> {
    const id = this.segmentIdCounter++;
    const newSegment: Segment = { ...segment, id, createdAt: new Date() };
    this.segments.set(id, newSegment);
    return newSegment;
  }

  async listSegments(filters?: any): Promise<Segment[]> {
    const allSegments = Array.from(this.segments.values());
    
    if (!filters) return allSegments;
    
    return allSegments.filter(segment => {
      if (filters.type && segment.type !== filters.type) return false;
      if (filters.organizationId && segment.organizationId !== filters.organizationId) return false;
      return true;
    });
  }

  // Journey operations
  async getJourney(id: number): Promise<Journey | undefined> {
    return this.journeys.get(id);
  }

  async createJourney(journey: InsertJourney): Promise<Journey> {
    const id = this.journeyIdCounter++;
    const newJourney: Journey = { ...journey, id, createdAt: new Date() };
    this.journeys.set(id, newJourney);
    return newJourney;
  }

  async updateJourneyStatus(id: number, status: string): Promise<Journey> {
    const journey = this.journeys.get(id);
    if (!journey) {
      throw new Error(`Journey with ID ${id} not found`);
    }
    
    const updatedJourney = { ...journey, status };
    this.journeys.set(id, updatedJourney);
    return updatedJourney;
  }

  async listJourneys(filters?: any): Promise<Journey[]> {
    const allJourneys = Array.from(this.journeys.values());
    
    if (!filters) return allJourneys;
    
    return allJourneys.filter(journey => {
      if (filters.status && journey.status !== filters.status) return false;
      if (filters.organizationId && journey.organizationId !== filters.organizationId) return false;
      return true;
    });
  }

  // Funnel operations
  async getFunnel(id: number): Promise<Funnel | undefined> {
    return this.funnels.get(id);
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    const id = this.funnelIdCounter++;
    const newFunnel: Funnel = { ...funnel, id, createdAt: new Date() };
    this.funnels.set(id, newFunnel);
    return newFunnel;
  }

  async listFunnels(filters?: any): Promise<Funnel[]> {
    const allFunnels = Array.from(this.funnels.values());
    
    if (!filters) return allFunnels;
    
    return allFunnels.filter(funnel => {
      if (filters.organizationId && funnel.organizationId !== filters.organizationId) return false;
      return true;
    });
  }

  async getFunnelAnalytics(id: number): Promise<any> {
    // Mock data for funnel analytics
    return {
      steps: [
        { name: "App Visit", value: 100 },
        { name: "Registration Start", value: 68.4 },
        { name: "Form Completion", value: 42.3 },
        { name: "Verification", value: 36.7 },
        { name: "Registration Complete", value: 28.5 }
      ]
    };
  }

  // Analytics operations
  async getUserStats(period?: string): Promise<any> {
    // Mock data for user stats
    return {
      activeUsers: 246329,
      activeCampaigns: 18,
      conversionRate: 3.2,
      engagementScore: 7.8,
      userGrowth: 12.8,
      campaignGrowth: 3,
      conversionTrend: -0.4,
      engagementTrend: 0.6
    };
  }

  async getCohortRetention(): Promise<any> {
    // Mock data for cohort retention
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

  // Helper method to initialize demo data
  private initializeDemoData() {
    // Create an organization
    const orgId = this.orgIdCounter++;
    const organization: Organization = {
      id: orgId,
      name: "EngageIQ Demo",
      plan: "enterprise",
      createdAt: new Date()
    };
    this.organizations.set(orgId, organization);

    // Create admin user
    const userId = this.userIdCounter++;
    const adminUser: User = {
      id: userId,
      username: "admin",
      password: "admin123",
      email: "admin@engageiq.com",
      fullName: "Alex Morgan",
      role: "admin",
      organizationId: orgId,
      profileImage: null,
      createdAt: new Date()
    };
    this.users.set(userId, adminUser);

    // Create some segments
    const segmentData = [
      { 
        name: "Active Power Users", 
        description: "Users who engage daily with the app", 
        type: "live", 
        filters: { 
          activityLevel: "high", 
          frequency: "daily" 
        } 
      },
      { 
        name: "Inactive (30+ days)", 
        description: "Users who haven't used the app in 30+ days", 
        type: "behavior", 
        filters: { 
          lastSeen: { operator: "moreThan", days: 30 } 
        } 
      },
      { 
        name: "Cart Abandoners", 
        description: "Users who added items to cart but didn't purchase", 
        type: "behavior", 
        filters: { 
          events: [
            { name: "add_to_cart", occurred: true },
            { name: "purchase", occurred: false }
          ] 
        } 
      },
      { 
        name: "Premium Subscribers", 
        description: "Users with premium subscription", 
        type: "profile", 
        filters: { 
          subscription: "premium" 
        } 
      },
      { 
        name: "New Users (7 days)", 
        description: "Users who signed up in the last 7 days", 
        type: "profile", 
        filters: { 
          createdAt: { operator: "lessThan", days: 7 } 
        } 
      }
    ];

    segmentData.forEach(segmentInfo => {
      const segmentId = this.segmentIdCounter++;
      const segment: Segment = {
        id: segmentId,
        name: segmentInfo.name,
        description: segmentInfo.description,
        type: segmentInfo.type,
        filters: segmentInfo.filters,
        createdBy: userId,
        organizationId: orgId,
        createdAt: new Date()
      };
      this.segments.set(segmentId, segment);
    });

    // Create some campaigns
    const campaignData = [
      {
        name: "Summer Sale Promotion",
        description: "Promote our summer sale to all users",
        channel: "push",
        status: "active",
        content: {
          title: "Summer Sale is ON!",
          body: "Enjoy up to 70% off on all items. Limited time only!",
          image: "summer_sale.jpg"
        }
      },
      {
        name: "New Feature Announcement",
        description: "Announce the new messaging feature",
        channel: "email",
        status: "active",
        content: {
          subject: "Exciting New Feature Just Launched!",
          body: "<h1>Check Out Our New Messaging Feature</h1><p>We've added a new way to connect with your friends...</p>"
        }
      },
      {
        name: "Re-engage Dormant Users",
        description: "Bring back users who haven't been active in 30+ days",
        channel: "push",
        status: "scheduled",
        content: {
          title: "We Miss You!",
          body: "Come back and see what's new. Special offer just for you!",
          image: "comeback.jpg"
        },
        scheduledAt: new Date(Date.now() + 86400000) // Tomorrow
      },
      {
        name: "Premium Upgrade Offer",
        description: "Offer discounted premium plan to regular users",
        channel: "in-app",
        status: "completed",
        content: {
          title: "Upgrade to Premium",
          body: "Get 50% off on your first year of Premium!",
          cta: "Upgrade Now"
        }
      },
      {
        name: "App Update Notification",
        description: "Notify users about the latest app update",
        channel: "push",
        status: "completed",
        content: {
          title: "App Update Available",
          body: "Update now to get the latest features and security improvements",
          image: "update.jpg"
        }
      }
    ];

    campaignData.forEach(campaignInfo => {
      const campaignId = this.campaignIdCounter++;
      const campaign: Campaign = {
        id: campaignId,
        name: campaignInfo.name,
        description: campaignInfo.description,
        channel: campaignInfo.channel,
        status: campaignInfo.status,
        content: campaignInfo.content,
        filters: null,
        segmentId: null,
        createdBy: userId,
        organizationId: orgId,
        scheduledAt: campaignInfo.scheduledAt || null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
      };
      this.campaigns.set(campaignId, campaign);
    });

    // Create a sample funnel
    const funnelId = this.funnelIdCounter++;
    const sampleFunnel: Funnel = {
      id: funnelId,
      name: "Registration Flow",
      description: "Tracks the user registration process",
      steps: [
        { name: "App Visit", event: "app_open" },
        { name: "Registration Start", event: "registration_start" },
        { name: "Form Completion", event: "form_completed" },
        { name: "Verification", event: "verification" },
        { name: "Registration Complete", event: "registration_complete" }
      ],
      createdBy: userId,
      organizationId: orgId,
      createdAt: new Date()
    };
    this.funnels.set(funnelId, sampleFunnel);

    // Create a sample journey
    const journeyId = this.journeyIdCounter++;
    const sampleJourney: Journey = {
      id: journeyId,
      name: "New User Onboarding",
      description: "Guides new users through the app features",
      steps: [
        {
          id: "welcome",
          type: "message",
          channel: "email",
          content: {
            subject: "Welcome to Our App!",
            body: "We're excited to have you on board"
          },
          delay: 0
        },
        {
          id: "feature_intro",
          type: "message",
          channel: "push",
          content: {
            title: "Discover Key Features",
            body: "Check out these amazing features"
          },
          delay: 86400 // 1 day
        },
        {
          id: "engagement_check",
          type: "condition",
          event: "app_open",
          branches: {
            true: "premium_offer",
            false: "re_engagement"
          },
          timeout: 172800 // 2 days
        },
        {
          id: "re_engagement",
          type: "message",
          channel: "push",
          content: {
            title: "We Miss You!",
            body: "Come back and explore more"
          }
        },
        {
          id: "premium_offer",
          type: "message",
          channel: "in-app",
          content: {
            title: "Upgrade to Premium",
            body: "Enjoy more features with our premium plan"
          }
        }
      ],
      status: "active",
      createdBy: userId,
      organizationId: orgId,
      createdAt: new Date()
    };
    this.journeys.set(journeyId, sampleJourney);
  }
}

// Import the new database storage implementation
import { DatabaseStorage } from "./storage-db";

// Switch to database storage
export const storage = new DatabaseStorage();
