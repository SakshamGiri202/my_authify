import { prisma } from "../db/client.js";
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
  generateApiKey,
} from "./crypto.js";
import { createSession } from "./session.js";

// Registration
export async function signUp(data: {
  email: string;
  password: string;
  name?: string;
  meta?: { ipAddress?: string; userAgent?: string };
}) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { success: false, error: "EMAIL_EXISTS" as const };
  }

  const passwordHash = await hashPassword(data.password);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: data.name?.trim() || null,
      passwordHash,
      emailVerified: false,
    },
  });

  // Generate Email Verification Token (24 hour expiration)
  const rawVerificationToken = generateRandomToken();
  const hashedToken = hashToken(rawVerificationToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.verificationToken.create({
    data: {
      identifier: newUser.email,
      token: hashedToken,
      expiresAt,
      type: "EMAIL_VERIFICATION",
    },
  });

  // Automatically sign in and return session
  const session = await createSession(newUser.id, data.meta);

  const { passwordHash: _, ...userWithoutPassword } = newUser;

  return {
    success: true,
    user: userWithoutPassword,
    session,
    verificationToken: rawVerificationToken,
  };
}

// Authentication / Login
export async function signIn(data: {
  email: string;
  password: string;
  meta?: { ipAddress?: string; userAgent?: string };
}) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    return { success: false, error: "INVALID_CREDENTIALS" as const };
  }

  const isValidPassword = await verifyPassword(data.password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: "INVALID_CREDENTIALS" as const };
  }

  const session = await createSession(user.id, data.meta);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    success: true,
    user: userWithoutPassword,
    session,
  };
}

// Verify Email Token
export async function verifyEmail(token: string) {
  const hashedToken = hashToken(token);

  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!tokenRecord || tokenRecord.type !== "EMAIL_VERIFICATION") {
    return { success: false, error: "INVALID_TOKEN" as const };
  }

  if (new Date() >= tokenRecord.expiresAt) {
    await prisma.verificationToken.delete({ where: { id: tokenRecord.id } }).catch(() => {});
    return { success: false, error: "TOKEN_EXPIRED" as const };
  }

  await prisma.user.update({
    where: { email: tokenRecord.identifier },
    data: { emailVerified: true },
  });

  await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

  return { success: true };
}

// Request Password Reset
export async function forgotPassword(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Return success to prevent email enumeration
    return { success: true };
  }

  // Delete existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: normalizedEmail,
      type: "PASSWORD_RESET",
    },
  });

  const rawResetToken = generateRandomToken();
  const hashedToken = hashToken(rawResetToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token: hashedToken,
      expiresAt,
      type: "PASSWORD_RESET",
    },
  });

  return {
    success: true,
    resetToken: rawResetToken,
  };
}

// Reset Password with Token
export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = hashToken(token);

  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!tokenRecord || tokenRecord.type !== "PASSWORD_RESET") {
    return { success: false, error: "INVALID_TOKEN" as const };
  }

  if (new Date() >= tokenRecord.expiresAt) {
    await prisma.verificationToken.delete({ where: { id: tokenRecord.id } }).catch(() => {});
    return { success: false, error: "TOKEN_EXPIRED" as const };
  }

  const newPasswordHash = await hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { email: tokenRecord.identifier },
    data: { passwordHash: newPasswordHash },
  });

  // Revoke all existing sessions for security
  await prisma.session.deleteMany({
    where: { userId: updatedUser.id },
  });

  await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

  return { success: true };
}

// Change Password (Authenticated)
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    return { success: false, error: "USER_NOT_FOUND" as const };
  }

  const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: "INVALID_CURRENT_PASSWORD" as const };
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { success: true };
}

// Update Profile
export async function updateProfile(
  userId: string,
  data: { name?: string; image?: string }
) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.image !== undefined ? { image: data.image.trim() } : {}),
    },
  });

  const { passwordHash: _, ...userWithoutPassword } = updatedUser;
  return { success: true, user: userWithoutPassword };
}

// API Key Management (Authify Plugin / Service Integration)
export async function createApiKey(userId: string, name: string, expirationDays?: number) {
  const { apiKey, keyHash, prefix } = generateApiKey();

  let expiresAt: Date | null = null;
  if (expirationDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
  }

  const record = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      prefix,
      expiresAt,
    },
  });

  return {
    id: record.id,
    name: record.name,
    prefix: record.prefix,
    apiKey, // Raw key returned ONCE to user
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
  };
}

export async function validateApiKey(rawApiKey: string) {
  const keyHash = hashToken(rawApiKey);

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKeyRecord) {
    return { apiKey: null, user: null };
  }

  if (apiKeyRecord.expiresAt && new Date() >= apiKeyRecord.expiresAt) {
    return { apiKey: null, user: null };
  }

  // Update last used timestamp async
  prisma.apiKey
    .update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  const { passwordHash: _, ...userWithoutPassword } = apiKeyRecord.user;

  return {
    apiKey: apiKeyRecord,
    user: userWithoutPassword,
  };
}

export async function listApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      prefix: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiKey(userId: string, apiKeyId: string) {
  await prisma.apiKey.deleteMany({
    where: {
      id: apiKeyId,
      userId,
    },
  });
  return { success: true };
}