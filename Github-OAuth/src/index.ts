import express, { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './utils/prisma';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import sessionRouter from './routes/session.routes';
import { deserializeUser } from './middleware/deserializeUser';

// Load environment variables
dotenv.config();

// Initialize prisma client
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json({
  limit: '100kb'
}));
app.use(cookieParser());
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN as unknown as string;
app.use(cors({
  origin: [FRONTEND_ORIGIN],
  credentials: true,
}));

// Apply deserializeUser middleware globally
app.use(deserializeUser);

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionRouter);

// Additional routes for direct OAuth access (to handle the URLs in the logs)
app.get("/auth/github/callback", (req, res) => {
  res.redirect(`/api/auth/github/callback${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`);
});

app.get("/api/sessions/oauth/github", (req, res) => {
  res.redirect(`/api/auth/github/callback${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`);
});

// Unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

// Health check endpoint
app.get('/api/healthchecker', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.status(200).json({
      status: "success",
      message: 'Server is up and running, Database connected'
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: 'Database connection failed'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
