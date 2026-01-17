import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log minimaliste pour Vercel
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
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
