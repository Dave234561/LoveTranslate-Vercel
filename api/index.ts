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

// Note: registerRoutes appelle setupAuth qui configure les sessions et passport
let routesRegistered = false;
const routesPromise = registerRoutes(app).then(() => {
  routesRegistered = true;
  console.log("Routes and Auth registered successfully");
});

// Middleware pour attendre que les routes soient prêtes
app.use(async (req, res, next) => {
  if (!routesRegistered) {
    await routesPromise;
  }
  next();
});

export default app;
