import { prisma } from "../db/client.js";
import { generateRandomToken, hashToken } from "./crypto.js";
const SESSION_EXPIRATION_DAYS = 30;
export async function createSession(userId, meta) {
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);
    const session = await prisma.session.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
            ipAddress: meta?.ipAddress || null,
            userAgent: meta?.userAgent || null,
        },
    });
    return {
        sessionId: session.id,
        rawToken,
        expiresAt,
    };
}
export async function validateSession(sessionId, rawToken) {
    if (!sessionId || !rawToken) {
        return { session: null, user: null };
    }
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
            user: true,
        },
    });
    if (!session) {
        return { session: null, user: null };
    }
    // Check expiration
    if (new Date() >= session.expiresAt) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => { });
        return { session: null, user: null };
    }
    // Check token match
    const expectedHash = hashToken(rawToken);
    if (session.tokenHash !== expectedHash) {
        return { session: null, user: null };
    }
    const { passwordHash, ...userWithoutPassword } = session.user;
    return {
        session,
        user: userWithoutPassword,
    };
}
export async function revokeSession(sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
}
export async function revokeAllUserSessions(userId, exceptSessionId) {
    await prisma.session.deleteMany({
        where: {
            userId,
            ...(exceptSessionId ? { NOT: { id: exceptSessionId } } : {}),
        },
    });
}
export async function getUserSessions(userId) {
    const sessions = await prisma.session.findMany({
        where: { userId },
        select: {
            id: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return sessions;
}
//# sourceMappingURL=session.js.map