import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log pour capturer les réponses JSON
app.use((req, res, next) => {
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

const routesPromise = (async () => {
  try {
    console.log("Starting route registration...");
    await registerRoutes(app);
    routesRegistered = true;
    console.log("Routes and Auth registered successfully");
  } catch (err) {
    console.error("Failed to register routes:", err);
    registrationError = err;
    throw err;
  }
})();

// Middleware pour attendre que les routes soient prêtes
app.use(async (req, res, next) => {
  if (registrationError) {
    return res.status(500).json({ 
      message: "Internal Server Error: Route registration failed",
      error: registrationError.message 
    });
  }
  
  if (!routesRegistered) {
    await routesPromise;
  }
  next();
});

export default app;
