import express from 'express';
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
  cookie: {
    secure: true, // Vercel is always HTTPS
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Global logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let initialized = false;
let initError: any = null;

async function initializeApp() {
  if (initialized) return;
  try {
    console.log("Initializing Auth and Routes...");
    setupAuth(app);
    await registerRoutes(app);
    initialized = true;
    console.log("App initialized successfully");
  } catch (err) {
    console.error("Initialization failed:", err);
    initError = err;
    throw err;
  }
}

app.use(async (req, res, next) => {
  try {
    await initializeApp();
    if (initError) {
      return res.status(500).json({ message: "Init Error", error: String(initError) });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: String(err) });
  }
});

export default app;
