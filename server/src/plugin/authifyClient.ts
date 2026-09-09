/**
 * MyAuthify SDK Plugin Client
 * Simple client SDK for integrating MyAuthify authentication into client web apps or microservices.
 */

export interface AuthifyConfig {
  baseUrl: string;
  apiKey?: string;
  credentials?: "include" | "same-origin" | "omit";
}

export class AuthifyClient {
  private baseUrl: string;
  private apiKey?: string;
  private credentials: "include" | "same-origin" | "omit";

  constructor(config: AuthifyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.credentials = config.credentials || "include";
  }

  private async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
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

    return data as T;
  }

  async signUp(email: string, password: string, name?: string) {
    return this.request("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async signIn(email: string, password: string) {
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

  async verifyEmail(token: string) {
    return this.request("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email: string) {
    return this.request("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async createApiKey(name: string, expirationDays?: number) {
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
