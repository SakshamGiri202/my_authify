import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateRequest } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import {
  signUp,
  signIn,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "../core/auth.js";
import {
  revokeSession,
  revokeAllUserSessions,
  getUserSessions,
} from "../core/session.js";

const router = Router();

// Helper to set session cookies
function setSessionCookies(
  res: Response,
  sessionId: string,
  rawToken: string,
  expiresAt: Date
) {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    expires: expiresAt,
  };

  res.cookie("sessionId", sessionId, cookieOptions);
  res.cookie("rawToken", rawToken, cookieOptions);
  res.cookie("authify_session", `${sessionId}.${rawToken}`, cookieOptions);
}

// Helper to clear session cookies
function clearSessionCookies(res: Response) {
  res.clearCookie("sessionId");
  res.clearCookie("rawToken");
  res.clearCookie("authify_session");
}

// Validation Schemas
const signUpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().optional(),
  }),
});

const signInSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
  }),
});

const createApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1, "API Key name is required"),
    expirationDays: z.number().int().positive().optional(),
  }),
});

// --- Public Endpoints ---

// 1. Sign Up
router.post(
  "/signup",
  authRateLimiter,
  validateRequest(signUpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
      };

      const result = await signUp({ email, password, name, meta });

      if (!result.success) {
        if (result.error === "EMAIL_EXISTS") {
          res.status(409).json({
            error: "EMAIL_EXISTS",
            message: "An account with this email already exists.",
          });
          return;
        }
      }

      setSessionCookies(
        res,
        result.session!.sessionId,
        result.session!.rawToken,
        result.session!.expiresAt
      );

      res.status(201).json({
        message: "User registered successfully",
        user: result.user,
        session: {
          sessionId: result.session!.sessionId,
          rawToken: result.session!.rawToken,
          token: `${result.session!.sessionId}.${result.session!.rawToken}`,
          expiresAt: result.session!.expiresAt,
        },
        verificationToken: result.verificationToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 2. Sign In
router.post(
  "/signin",
  authRateLimiter,
  validateRequest(signInSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
      };

      const result = await signIn({ email, password, meta });

      if (!result.success) {
        res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        });
        return;
      }

      setSessionCookies(
        res,
        result.session!.sessionId,
        result.session!.rawToken,
        result.session!.expiresAt
      );

      res.status(200).json({
        message: "Signed in successfully",
        user: result.user,
        session: {
          sessionId: result.session!.sessionId,
          rawToken: result.session!.rawToken,
          token: `${result.session!.sessionId}.${result.session!.rawToken}`,
          expiresAt: result.session!.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// 3. Sign Out
router.post(
  "/signout",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let sessionId = req.cookies?.sessionId || req.session?.id;

      if (!sessionId && req.cookies?.authify_session) {
        sessionId = req.cookies.authify_session.split(".")[0];
      }

      if (!sessionId && req.headers.authorization?.startsWith("Bearer ")) {
        const tokenStr = req.headers.authorization.substring(7).trim();
        if (tokenStr.includes(".")) {
          sessionId = tokenStr.split(".")[0];
        }
      }

      if (sessionId) {
        await revokeSession(sessionId);
      }
      clearSessionCookies(res);
      res.status(200).json({ message: "Signed out successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// 4. Verify Email
router.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await verifyEmail(token);

      if (!result.success) {
        res.status(400).json({
          error: result.error,
          message:
            result.error === "TOKEN_EXPIRED"
              ? "Verification link has expired."
              : "Invalid verification token.",
        });
        return;
      }

      res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// 5. Forgot Password
router.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await forgotPassword(email);

      res.status(200).json({
        message:
          "If an account exists with that email, a password reset link has been generated.",
        resetToken: result.resetToken || null,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 6. Reset Password
router.post(
  "/reset-password",
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      const result = await resetPassword(token, newPassword);

      if (!result.success) {
        res.status(400).json({
          error: result.error,
          message:
            result.error === "TOKEN_EXPIRED"
              ? "Password reset link has expired."
              : "Invalid reset token.",
        });
        return;
      }

      clearSessionCookies(res);
      res.status(200).json({ message: "Password reset successfully. Please sign in with your new password." });
    } catch (error) {
      next(error);
    }
  }
);

// --- Authenticated Endpoints ---

// 7. Get Current Session & User Info
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        user: req.user,
        session: req.session || null,
        apiKey: req.apiKey
          ? {
              id: req.apiKey.id,
              name: req.apiKey.name,
              prefix: req.apiKey.prefix,
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 8. Change Password
router.post(
  "/change-password",
  requireAuth,
  validateRequest(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await changePassword(req.user!.id, currentPassword, newPassword);

      if (!result.success) {
        res.status(400).json({
          error: result.error,
          message: "Current password is incorrect.",
        });
        return;
      }

      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// 9. Update Profile
router.patch(
  "/profile",
  requireAuth,
  validateRequest(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, image } = req.body;
      const result = await updateProfile(req.user!.id, { name, image });
      res.status(200).json({
        message: "Profile updated successfully.",
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 10. List Active Sessions
router.get(
  "/sessions",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessions = await getUserSessions(req.user!.id);
      const currentSessionId = req.session?.id;

      const formattedSessions = sessions.map((s) => ({
        ...s,
        isCurrent: s.id === currentSessionId,
      }));

      res.status(200).json({ sessions: formattedSessions });
    } catch (error) {
      next(error);
    }
  }
);

// 11. Revoke Specific Session
router.delete(
  "/sessions/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetSessionId = req.params.id as string;
      await revokeSession(targetSessionId);

      if (targetSessionId === req.session?.id) {
        clearSessionCookies(res);
      }

      res.status(200).json({ message: "Session revoked successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// 12. Revoke All Other Sessions
router.delete(
  "/sessions",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentSessionId = req.session?.id;
      await revokeAllUserSessions(req.user!.id, currentSessionId);
      res.status(200).json({ message: "All other sessions revoked successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// 13. Create API Key
router.post(
  "/api-keys",
  requireAuth,
  validateRequest(createApiKeySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, expirationDays } = req.body;
      const apiKeyData = await createApiKey(req.user!.id, name, expirationDays);
      res.status(201).json({
        message: "API Key generated successfully. Keep your key safe as it will not be displayed again.",
        apiKey: apiKeyData,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 14. List API Keys
router.get(
  "/api-keys",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const keys = await listApiKeys(req.user!.id);
      res.status(200).json({ apiKeys: keys });
    } catch (error) {
      next(error);
    }
  }
);

// 15. Revoke API Key
router.delete(
  "/api-keys/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiKeyId = req.params.id as string;
      await revokeApiKey(req.user!.id, apiKeyId);
      res.status(200).json({ message: "API key revoked successfully." });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
