import { Session, User } from "@prisma/client";
export interface SessionResult {
    session: Session | null;
    user: Omit<User, "passwordHash"> | null;
}
export declare function createSession(userId: string, meta?: {
    ipAddress?: string;
    userAgent?: string;
}): Promise<{
    sessionId: string;
    rawToken: string;
    expiresAt: Date;
}>;
export declare function validateSession(sessionId: string, rawToken: string): Promise<SessionResult>;
export declare function revokeSession(sessionId: string): Promise<void>;
export declare function revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<void>;
export declare function getUserSessions(userId: string): Promise<{
    id: string;
    createdAt: Date;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
}[]>;
//# sourceMappingURL=session.d.ts.map