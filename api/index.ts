import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import { registerRoutes } from '../server/routes.js';
import { storage } from '../server/storage.js';
import { setupAuth } from '../server/auth.js';

const app = express();
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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Express with Auth is working',
    timestamp: new Date().toISOString()
  });
});

let initialized = false;

export default async (req: any, res: any) => {
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
    console.error("[API] Critical error during request handling:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
