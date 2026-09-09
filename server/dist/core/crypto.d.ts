export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function generateRandomToken(bytes?: number): string;
export declare function hashToken(token: string): string;
export declare function generateApiKey(): {
    apiKey: string;
    keyHash: string;
    prefix: string;
};
//# sourceMappingURL=crypto.d.ts.map