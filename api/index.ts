import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';
import { setupAuth } from '../server/auth';

console.log("[API] Module loading start...");

const app = express();

try {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.set('trust proxy', 1);

  app.use(session({
    store: storage.sessionStore,
    secret: process.env.SESSION_SECRET || 'amour-lingua-fallback-secret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[API LOG] ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    console.log("[API] Health check requested");
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  console.log("[API] Basic middlewares configured.");
} catch (e) {
  console.error("[API] Error during basic middleware config:", e);
}

let initialized = false;

export default async (req: any, res: any) => {
  console.log(`[API] Request received: ${req.method} ${req.url}`);
  try {
    if (!initialized) {
      console.log("[API] Initializing routes and auth...");
      setupAuth(app);
      await registerRoutes(app);
      initialized = true;
      console.log("[API] Initialization complete.");
    }
    return app(req, res);
  } catch (error: any) {
    console.error('[API] Fatal Error during request handling:', error);
    if (!res.headersSent) {
      res.status(500).send(`Internal Server Error: ${error.message}\n${error.stack}`);
    }
  }
};

console.log("[API] Module loading complete.");
