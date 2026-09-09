/**
 * MyAuthify SDK Plugin Client
 * Simple client SDK for integrating MyAuthify authentication into client web apps or microservices.
 */
export class AuthifyClient {
    baseUrl;
    apiKey;
    credentials;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.apiKey = config.apiKey;
        this.credentials = config.credentials || "include";
    }
    async request(path, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };
        if (this.apiKey) {
            headers["x-api-key"] = this.apiKey;
        }
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers,
            credentials: this.credentials,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || "Authify Request Failed");
        }
        return data;
    }
    async signUp(email, password, name) {
        return this.request("/api/v1/auth/signup", {
            method: "POST",
            body: JSON.stringify({ email, password, name }),
        });
    }
    async signIn(email, password) {
        return this.request("/api/v1/auth/signin", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }
    async signOut() {
        return this.request("/api/v1/auth/signout", {
            method: "POST",
        });
    }
    async getSession() {
        return this.request("/api/v1/auth/me", {
            method: "GET",
        });
    }
    async verifyEmail(token) {
        return this.request("/api/v1/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    }
    async forgotPassword(email) {
        return this.request("/api/v1/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    }
    async resetPassword(token, newPassword) {
        return this.request("/api/v1/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, newPassword }),
        });
    }
    async createApiKey(name, expirationDays) {
        return this.request("/api/v1/auth/api-keys", {
            method: "POST",
            body: JSON.stringify({ name, expirationDays }),
        });
    }
    async listApiKeys() {
        return this.request("/api/v1/auth/api-keys", {
            method: "GET",
        });
    }
}
//# sourceMappingURL=authifyClient.js.map