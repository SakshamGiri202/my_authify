export declare function signUp(data: {
    email: string;
    password: string;
    name?: string;
    meta?: {
        ipAddress?: string;
        userAgent?: string;
    };
}): Promise<{
    success: boolean;
    error: "EMAIL_EXISTS";
    user?: undefined;
    session?: undefined;
    verificationToken?: undefined;
} | {
    success: boolean;
    user: {
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    };
    session: {
        sessionId: string;
        rawToken: string;
        expiresAt: Date;
    };
    verificationToken: string;
    error?: undefined;
}>;
export declare function signIn(data: {
    email: string;
    password: string;
    meta?: {
        ipAddress?: string;
        userAgent?: string;
    };
}): Promise<{
    success: boolean;
    error: "INVALID_CREDENTIALS";
    user?: undefined;
    session?: undefined;
} | {
    success: boolean;
    user: {
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    };
    session: {
        sessionId: string;
        rawToken: string;
        expiresAt: Date;
    };
    error?: undefined;
}>;
export declare function verifyEmail(token: string): Promise<{
    success: boolean;
    error: "INVALID_TOKEN";
} | {
    success: boolean;
    error: "TOKEN_EXPIRED";
} | {
    success: boolean;
    error?: undefined;
}>;
export declare function forgotPassword(email: string): Promise<{
    success: boolean;
    resetToken?: undefined;
} | {
    success: boolean;
    resetToken: string;
}>;
export declare function resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    error: "INVALID_TOKEN";
} | {
    success: boolean;
    error: "TOKEN_EXPIRED";
} | {
    success: boolean;
    error?: undefined;
}>;
export declare function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    error: "USER_NOT_FOUND";
} | {
    success: boolean;
    error: "INVALID_CURRENT_PASSWORD";
} | {
    success: boolean;
    error?: undefined;
}>;
export declare function updateProfile(userId: string, data: {
    name?: string;
    image?: string;
}): Promise<{
    success: boolean;
    user: {
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
export declare function createApiKey(userId: string, name: string, expirationDays?: number): Promise<{
    id: string;
    name: string;
    prefix: string;
    apiKey: string;
    expiresAt: Date | null;
    createdAt: Date;
}>;
export declare function validateApiKey(rawApiKey: string): Promise<{
    apiKey: null;
    user: null;
} | {
    apiKey: {
        user: {
            name: string | null;
            id: string;
            email: string;
            passwordHash: string | null;
            emailVerified: boolean;
            image: string | null;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date | null;
        keyHash: string;
        prefix: string;
        lastUsedAt: Date | null;
    };
    user: {
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
export declare function listApiKeys(userId: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    expiresAt: Date | null;
    prefix: string;
    lastUsedAt: Date | null;
}[]>;
export declare function revokeApiKey(userId: string, apiKeyId: string): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=auth.d.ts.map