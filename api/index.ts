import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';
import { setupAuth } from '../server/auth';

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
  res.json({ status: 'ok', message: 'Express with Auth is working' });
});

// Initialization flag
let initialized = false;

export default async (req: any, res: any) => {
  if (!initialized) {
    setupAuth(app);
    await registerRoutes(app);
    initialized = true;
  }
  return app(req, res);
};
