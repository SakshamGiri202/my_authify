/**
 * MyAuthify SDK Plugin Client
 * Simple client SDK for integrating MyAuthify authentication into client web apps or microservices.
 */
export interface AuthifyConfig {
    baseUrl: string;
    apiKey?: string;
    credentials?: "include" | "same-origin" | "omit";
}
export declare class AuthifyClient {
    private baseUrl;
    private apiKey?;
    private credentials;
    constructor(config: AuthifyConfig);
    private request;
    signUp(email: string, password: string, name?: string): Promise<any>;
    signIn(email: string, password: string): Promise<any>;
    signOut(): Promise<any>;
    getSession(): Promise<any>;
    verifyEmail(token: string): Promise<any>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(token: string, newPassword: string): Promise<any>;
    createApiKey(name: string, expirationDays?: number): Promise<any>;
    listApiKeys(): Promise<any>;
}
//# sourceMappingURL=authifyClient.d.ts.map