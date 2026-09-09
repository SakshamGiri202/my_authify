import rateLimit from "express-rate-limit";

// Strict rate limiter for sensitive authentication endpoints (SignUp, SignIn, Reset Password)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
});

// General rate limiter for standard API routes
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Rate limit exceeded. Please try again in a minute.",
  },
});
