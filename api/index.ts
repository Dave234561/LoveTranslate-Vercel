import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';
import { setupAuth } from '../server/auth';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Session configuration
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

// Global logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API LOG] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Immediate initialization
setupAuth(app);
registerRoutes(app).catch(err => {
  console.error("Failed to register routes:", err);
});

export default app;
