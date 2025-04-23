import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertCampaignSchema, 
  insertSegmentSchema, 
  insertJourneySchema, 
  insertFunnelSchema 
} from "@shared/schema";
import { upload, handleUploadError, getFileUrl } from "./upload";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you would use JWT or sessions
      return res.status(200).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        profileImage: user.profileImage 
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const organizationId = req.query.organizationId ? 
        parseInt(req.query.organizationId as string) : undefined;
      
      const users = await storage.listUsers(organizationId);
      return res.status(200).json(users);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Event routes
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      }
      
      console.error("Create event error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const filters = req.query;
      const events = await storage.getEvents(filters);
      return res.status(200).json(events);
    } catch (error) {
      console.error("Get events error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/counts", async (req, res) => {
    try {
      const period = req.query.period as string | undefined;
      const counts = await storage.getEventCounts(period);
      return res.status(200).json(counts);
    } catch (error) {
      console.error("Get event counts error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const filters = req.query;
      const campaigns = await storage.listCampaigns(filters);
      return res.status(200).json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      return res.status(200).json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      return res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid campaign data", 
          errors: error.errors 
        });
      }
      
      console.error("Create campaign error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/campaigns/:id/status", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const campaign = await storage.updateCampaignStatus(campaignId, status);
      return res.status(200).json(campaign);
    } catch (error) {
      console.error("Update campaign status error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Segment routes
  app.get("/api/segments", async (req, res) => {
    try {
      const filters = req.query;
      const segments = await storage.listSegments(filters);
      return res.status(200).json(segments);
    } catch (error) {
      console.error("Get segments error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/segments/:id", async (req, res) => {
    try {
      const segmentId = parseInt(req.params.id);
      const segment = await storage.getSegment(segmentId);
      
      if (!segment) {
        return res.status(404).json({ message: "Segment not found" });
      }
      
      return res.status(200).json(segment);
    } catch (error) {
      console.error("Get segment error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/segments", async (req, res) => {
    try {
      const segmentData = insertSegmentSchema.parse(req.body);
      const segment = await storage.createSegment(segmentData);
      return res.status(201).json(segment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid segment data", 
          errors: error.errors 
        });
      }
      
      console.error("Create segment error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Journey routes
  app.get("/api/journeys", async (req, res) => {
    try {
      const filters = req.query;
      const journeys = await storage.listJourneys(filters);
      return res.status(200).json(journeys);
    } catch (error) {
      console.error("Get journeys error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/journeys/:id", async (req, res) => {
    try {
      const journeyId = parseInt(req.params.id);
      const journey = await storage.getJourney(journeyId);
      
      if (!journey) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      return res.status(200).json(journey);
    } catch (error) {
      console.error("Get journey error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/journeys", async (req, res) => {
    try {
      const journeyData = insertJourneySchema.parse(req.body);
      const journey = await storage.createJourney(journeyData);
      return res.status(201).json(journey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid journey data", 
          errors: error.errors 
        });
      }
      
      console.error("Create journey error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/journeys/:id/status", async (req, res) => {
    try {
      const journeyId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const journey = await storage.updateJourneyStatus(journeyId, status);
      return res.status(200).json(journey);
    } catch (error) {
      console.error("Update journey status error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Funnel routes
  app.get("/api/funnels", async (req, res) => {
    try {
      const filters = req.query;
      const funnels = await storage.listFunnels(filters);
      return res.status(200).json(funnels);
    } catch (error) {
      console.error("Get funnels error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/funnels/:id", async (req, res) => {
    try {
      const funnelId = parseInt(req.params.id);
      const funnel = await storage.getFunnel(funnelId);
      
      if (!funnel) {
        return res.status(404).json({ message: "Funnel not found" });
      }
      
      return res.status(200).json(funnel);
    } catch (error) {
      console.error("Get funnel error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/funnels", async (req, res) => {
    try {
      const funnelData = insertFunnelSchema.parse(req.body);
      const funnel = await storage.createFunnel(funnelData);
      return res.status(201).json(funnel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid funnel data", 
          errors: error.errors 
        });
      }
      
      console.error("Create funnel error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/funnels/:id/analytics", async (req, res) => {
    try {
      const funnelId = parseInt(req.params.id);
      const analytics = await storage.getFunnelAnalytics(funnelId);
      return res.status(200).json(analytics);
    } catch (error) {
      console.error("Get funnel analytics error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/user-stats", async (req, res) => {
    try {
      const period = req.query.period as string | undefined;
      const stats = await storage.getUserStats(period);
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/analytics/cohort-retention", async (req, res) => {
    try {
      const retention = await storage.getCohortRetention();
      return res.status(200).json(retention);
    } catch (error) {
      console.error("Get cohort retention error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/analytics/channel-performance", async (req, res) => {
    try {
      const performance = await storage.getChannelPerformance();
      return res.status(200).json(performance);
    } catch (error) {
      console.error("Get channel performance error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/analytics/message-stats", async (req, res) => {
    try {
      const campaignId = req.query.campaignId ? 
        parseInt(req.query.campaignId as string) : undefined;
      
      const stats = await storage.getMessageStats(campaignId);
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Get message stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
