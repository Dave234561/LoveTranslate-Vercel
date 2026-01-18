export default async (req: any, res: any) => {
  console.log(`[API DEBUG] Request received: ${req.method} ${req.url}`);
  res.status(200).json({
    message: "Minimalist API handler is working",
    method: req.method,
    url: req.url,
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      has_session_secret: !!process.env.SESSION_SECRET
    }
  });
};
