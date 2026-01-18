import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { setupTranslations } from "./translations.js";
import { setupMessages } from "./messages.js";

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
