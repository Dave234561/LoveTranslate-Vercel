import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import fs from 'fs';

// Helper to check file existence for debugging
const checkFile = (p: string) => {
  const fullPath = path.resolve(process.cwd(), p);
  const exists = fs.existsSync(fullPath);
  console.log(`[API] Checking ${fullPath}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  return exists;
};

checkFile('./server/routes.ts');
checkFile('./server/storage.ts');
checkFile('./server/auth.ts');

// Use dynamic imports to handle potential resolution issues at runtime
let registerRoutes: any;
let storage: any;
let setupAuth: any;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Express is working',
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    files: {
      server: fs.existsSync(path.resolve(process.cwd(), './server')),
      routes: fs.existsSync(path.resolve(process.cwd(), './server/routes.ts'))
    }
  });
});

let initialized = false;

export default async (req: any, res: any) => {
  try {
    if (!initialized) {
      console.log("[API] Dynamically importing modules...");
      
      // We use relative paths from the compiled api/index.js location
      const routesMod = await import('../server/routes.js');
      const storageMod = await import('../server/storage.js');
      const authMod = await import('../server/auth.js');
      
      registerRoutes = routesMod.registerRoutes;
      storage = storageMod.storage;
      setupAuth = authMod.setupAuth;

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
      stack: error.stack,
      code: error.code
    });
  }
};
