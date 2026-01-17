import express from 'express';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log global pour Vercel
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);
    }
  });

  next();
});

let routesRegistered = false;
let registrationError: any = null;
let registrationPromise: Promise<void> | null = null;

async function ensureRoutes() {
  if (routesRegistered) return;
  if (registrationPromise) return registrationPromise;
  
  registrationPromise = (async () => {
    try {
      console.log("Starting route registration...");
      await registerRoutes(app);
      
      // Route de test pour forcer une session
      app.get("/api/force-login", async (req, res) => {
        const user = await storage.getUserByUsername("test");
        if (user) {
          req.login(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Forced login successful", user });
          });
        } else {
          res.status(404).json({ message: "Test user not found" });
        }
      });

      routesRegistered = true;
      console.log("Routes and Auth registered successfully");
    } catch (err) {
      console.error("Failed to register routes:", err);
      registrationError = err;
      throw err;
    }
  })();
  
  return registrationPromise;
}

// Middleware pour attendre que les routes soient prêtes
app.use(async (req, res, next) => {
  try {
    await ensureRoutes();
    if (registrationError) {
      return res.status(500).json({ 
        message: "Internal Server Error: Route registration failed",
        error: registrationError.message 
      });
    }
    next();
  } catch (err: any) {
    console.error("Initialization error middleware:", err);
    res.status(500).json({ message: "Initialization error", error: err.message });
  }
});

export default app;
