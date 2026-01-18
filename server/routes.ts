import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupTranslations } from "./translations";
import { setupMessages } from "./messages";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup translation routes
  setupTranslations(app);
  
  // Setup messaging routes
  setupMessages(app);
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
