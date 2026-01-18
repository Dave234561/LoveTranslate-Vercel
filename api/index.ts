import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Express is working on Vercel',
    env: {
      has_db_url: !!process.env.DATABASE_URL
    }
  });
});

app.post('/api/register', (req: Request, res: Response) => {
  console.log("[API] Register attempt:", req.body);
  res.json({
    message: "Register endpoint reached",
    received_data: req.body
  });
});

export default app;
