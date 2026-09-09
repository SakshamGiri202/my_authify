import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Allowed origins configuration
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev/plugin integration
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global rate limiting to API routes
app.use("/api", apiRateLimiter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "MyAuthify Authentication Server",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "MyAuthify Authentication Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount Authentication routes
app.use("/api/v1/auth", authRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
