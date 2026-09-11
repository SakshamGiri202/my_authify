import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Lock,
  User,
  Zap,
  CheckCircle,
  Copy,
  Terminal,
  RefreshCw,
  Trash2,
  Globe,
  Layers,
  ArrowRight,
  Code,
  ShieldCheck,
  Cpu,
  LogOut,
  Mail,
  KeyRound,
} from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:5000";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  role: string;
}

interface SessionItem {
  id: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  isCurrent?: boolean;
}

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<"auth" | "sessions" | "apikeys" | "sdk">("auth");
  const [authMode, setAuthMode] = useState<"signup" | "signin" | "forgot">("signin");
  
  // Form Inputs
  const [email, setEmail] = useState("dev@authify.com");
  const [password, setPassword] = useState("Password123!");
  const [name, setName] = useState("Developer User");
  const [keyName, setKeyName] = useState("Production Microservice Key");

  // State Data
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Status & Logs
  const [healthStatus, setHealthStatus] = useState<"online" | "offline" | "checking">("checking");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [sdkTab, setSdkTab] = useState<"ts" | "react" | "curl" | "express">("ts");
  const [copied, setCopied] = useState(false);

  // Check Backend Server Health
  const checkHealth = async () => {
    setHealthStatus("checking");
    try {
      const res = await fetch(`${API_BASE}/api/v1/health`);
      if (res.ok) {
        setHealthStatus("online");
      } else {
        setHealthStatus("offline");
      }
    } catch {
      setHealthStatus("offline");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sign Up Request
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setCurrentUser(data.user);
      setSessionToken(data.session.token);
      showNotify("success", "Registration successful! Session token created.");
    } catch (err: any) {
      showNotify("error", err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Sign In Request
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setCurrentUser(data.user);
      setSessionToken(data.session.token);
      showNotify("success", `Welcome back, ${data.user.name || data.user.email}!`);
      fetchSessions(data.session.token);
      fetchApiKeys(data.session.token);
    } catch (err: any) {
      showNotify("error", err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Out Request
  const handleSignOut = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/auth/signout`, {
        method: "POST",
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      });
      setCurrentUser(null);
      setSessionToken("");
      setSessions([]);
      setApiKeys([]);
      showNotify("success", "Signed out successfully.");
    } catch {
      showNotify("error", "Sign out error.");
    }
  };

  // Fetch Active Sessions
  const fetchSessions = async (token: string = sessionToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Revoke Session
  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        showNotify("success", "Session revoked successfully.");
        fetchSessions();
      }
    } catch {
      showNotify("error", "Failed to revoke session.");
    }
  };

  // Fetch API Keys
  const fetchApiKeys = async (token: string = sessionToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create API Key
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      showNotify("error", "Please sign in first to generate API keys.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ name: keyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setGeneratedKey(data.apiKey.apiKey);
      showNotify("success", "API Key generated! Save it now.");
      fetchApiKeys();
    } catch (err: any) {
      showNotify("error", err.message || "Failed to generate API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Revoke API Key
  const handleRevokeApiKey = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        showNotify("success", "API Key revoked.");
        fetchApiKeys();
      }
    } catch {
      showNotify("error", "Failed to revoke API key.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Code Snippets for SDK Showcase
  const sdkSnippets = {
    ts: `import { AuthifyClient } from "my-authify-sdk";

const authify = new AuthifyClient({
  baseUrl: "${API_BASE}",
});

// Authenticate user
const { user, session } = await authify.signIn("dev@authify.com", "SecretPass123!");
console.log("Logged in user:", user.email);`,

    react: `import { useState, useEffect } from "react";

export function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("${API_BASE}/api/v1/auth/me", {
      headers: { Authorization: \`Bearer \${localStorage.getItem("token")}\` }
    })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  return <div>Welcome, {user?.name}</div>;
}`,

    curl: `# Authenticate via API Key Header
curl -X GET "${API_BASE}/api/v1/auth/me" \\
  -H "x-api-key: authify_live_b5a32eb719f..."

# Sign In with Email & Password
curl -X POST "${API_BASE}/api/v1/auth/signin" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"dev@authify.com","password":"Password123!"}'`,

    express: `import { requireAuth } from "./middleware/auth.js";

// Protected express route
app.get("/api/protected-data", requireAuth, (req, res) => {
  res.json({
    message: "Authorized access",
    userId: req.user.id,
    apiKey: req.apiKey?.name
  });
});`,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            background: notification.type === "success" ? "var(--bg-surface)" : "var(--accent-rose-bg)",
            border: `1px solid ${notification.type === "success" ? "var(--accent-emerald)" : "var(--accent-rose)"}`,
            color: notification.type === "success" ? "var(--accent-emerald)" : "var(--accent-rose)",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          {notification.type === "success" ? <CheckCircle size={18} /> : <Shield size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header / Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(22, 23, 29, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                border: "1px solid var(--border-active)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
              }}
            >
              <Shield size={20} />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" }}>
              My<span style={{ color: "var(--accent-violet)" }}>Authify</span>
            </span>
            <span className="badge badge-violet" style={{ marginLeft: "8px" }}>
              v1.0.0
            </span>
          </div>

          {/* Health Status & Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                background: "var(--bg-surface)",
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor:
                    healthStatus === "online"
                      ? "var(--accent-emerald)"
                      : healthStatus === "checking"
                      ? "var(--accent-amber)"
                      : "var(--accent-rose)",
                  boxShadow:
                    healthStatus === "online" ? "0 0 8px var(--accent-emerald)" : "none",
                }}
              />
              <span style={{ color: "var(--text-muted)" }}>
                Server:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {healthStatus === "online" ? "Online (Port 5000)" : "Connecting..."}
                </strong>
              </span>
              <button
                onClick={checkHealth}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  display: "flex",
                }}
                title="Refresh Status"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="badge badge-emerald">
                  <User size={12} /> {currentUser.email}
                </span>
                <button className="btn btn-danger btn-sm" onClick={handleSignOut}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setActiveTab("auth");
                  setAuthMode("signin");
                }}
              >
                <Key size={14} /> Developer Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            className="badge badge-violet"
            style={{ marginBottom: "20px", padding: "6px 14px", fontSize: "13px" }}
          >
            <Zap size={14} /> Express + Prisma ORM + PostgreSQL Backend
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 700,
              letterSpacing: "-1.5px",
              lineHeight: 1.15,
              marginBottom: "18px",
            }}
          >
            Instant Auth & API Key Management <br />
            <span style={{ color: "var(--accent-violet)" }}>For Modern Web Apps</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "var(--text-muted)",
              maxWidth: "680px",
              margin: "0 auto 32px",
            }}
          >
            A developer-first, self-hosted authentication service inspired by BetterAuth. Plug-and-play session management,
            password hashing, email verification, and API key credentials.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => setActiveTab("auth")}>
              Try Auth Demo <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline" onClick={() => setActiveTab("sdk")}>
              <Code size={16} /> View SDK Sandbox
            </button>
          </div>
        </div>

        {/* Interactive Dashboard Tabs */}
        <div className="glass-card" style={{ marginBottom: "56px" }}>
          {/* Navigation Bar for Dashboard */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border-subtle)",
              padding: "8px 16px",
              gap: "8px",
              overflowX: "auto",
            }}
          >
            <button
              className={`btn btn-sm ${activeTab === "auth" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setActiveTab("auth")}
            >
              <Lock size={14} /> Authentication Widget
            </button>
            <button
              className={`btn btn-sm ${activeTab === "sessions" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => {
                setActiveTab("sessions");
                if (sessionToken) fetchSessions();
              }}
            >
              <Layers size={14} /> Active Sessions ({sessions.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "apikeys" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => {
                setActiveTab("apikeys");
                if (sessionToken) fetchApiKeys();
              }}
            >
              <Key size={14} /> API Key Credentials ({apiKeys.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "sdk" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setActiveTab("sdk")}
            >
              <Terminal size={14} /> SDK Sandbox
            </button>
          </div>

          {/* Tab 1: Authentication Widget */}
          {activeTab === "auth" && (
            <div style={{ padding: "32px" }}>
              <div style={{ maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                  <button
                    style={{ flex: 1 }}
                    className={`btn btn-sm ${authMode === "signin" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setAuthMode("signin")}
                  >
                    Sign In
                  </button>
                  <button
                    style={{ flex: 1 }}
                    className={`btn btn-sm ${authMode === "signup" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={authMode === "signup" ? handleSignUp : handleSignIn}>
                  {authMode === "signup" && (
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "var(--text-muted)" }}>
                        Full Name
                      </label>
                      <input
                        className="input-field"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "var(--text-muted)" }}>
                      Email Address
                    </label>
                    <input
                      className="input-field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dev@authify.com"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "var(--text-muted)" }}>
                      Password
                    </label>
                    <input
                      className="input-field"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                    {loading ? "Processing..." : authMode === "signup" ? "Create Account" : "Sign In to Account"}
                  </button>
                </form>

                {currentUser && (
                  <div
                    style={{
                      marginTop: "32px",
                      padding: "16px",
                      background: "#0d0e12",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-emerald)", marginBottom: "8px" }}>
                      Active Authenticated User
                    </div>
                    <div className="font-mono" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      ID: {currentUser.id} <br />
                      Email: {currentUser.email} <br />
                      Verified: {currentUser.emailVerified ? "True" : "False"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Sessions Inspector */}
          {activeTab === "sessions" && (
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Active User Sessions</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                    Real-time session monitoring & single-click revocation.
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => fetchSessions()}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {!sessionToken ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Please sign in on the Authentication Widget tab to view your sessions.
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No active sessions found.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>IP Address</th>
                      <th>User Agent</th>
                      <th>Created</th>
                      <th>Expires</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td className="font-mono">
                          {s.id.substring(0, 8)}...
                          {s.isCurrent && <span className="badge badge-emerald" style={{ marginLeft: "8px" }}>Current</span>}
                        </td>
                        <td className="font-mono">{s.ipAddress || "::1"}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{s.userAgent || "Browser"}</td>
                        <td>{new Date(s.createdAt).toLocaleTimeString()}</td>
                        <td>{new Date(s.expiresAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRevokeSession(s.id)}>
                            <Trash2 size={12} /> Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab 3: API Key Credentials */}
          {activeTab === "apikeys" && (
            <div style={{ padding: "32px" }}>
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>Generate New API Key</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Issue a scoped API Key for external microservices (`x-api-key`).
                </p>

                <form onSubmit={handleCreateApiKey} style={{ display: "flex", gap: "12px", maxWidth: "600px" }}>
                  <input
                    className="input-field"
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Key Name (e.g. Production Service)"
                    required
                  />
                  <button className="btn btn-primary" disabled={loading}>
                    Generate Key
                  </button>
                </form>

                {generatedKey && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      background: "#0d0e12",
                      border: "1px solid var(--accent-emerald)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-emerald)", marginBottom: "6px" }}>
                      Raw API Key Generated (Copy & Save Now):
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <code className="font-mono" style={{ fontSize: "13px", color: "var(--text-primary)", flex: 1 }}>
                        {generatedKey}
                      </code>
                      <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(generatedKey)}>
                        <Copy size={14} /> {copied ? "Copied!" : "Copy Key"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Existing API Keys</h3>
              {!sessionToken ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Please sign in first to manage API keys.
                </div>
              ) : apiKeys.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No API keys issued yet.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Key Name</th>
                      <th>Prefix</th>
                      <th>Created</th>
                      <th>Last Used</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((k) => (
                      <tr key={k.id}>
                        <td style={{ fontWeight: 500 }}>{k.name}</td>
                        <td className="font-mono">{k.prefix}...</td>
                        <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRevokeApiKey(k.id)}>
                            <Trash2 size={12} /> Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab 4: SDK Sandbox */}
          {activeTab === "sdk" && (
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className={`btn btn-sm ${sdkTab === "ts" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setSdkTab("ts")}
                  >
                    TypeScript SDK
                  </button>
                  <button
                    className={`btn btn-sm ${sdkTab === "react" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setSdkTab("react")}
                  >
                    React Integration
                  </button>
                  <button
                    className={`btn btn-sm ${sdkTab === "curl" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setSdkTab("curl")}
                  >
                    cURL REST API
                  </button>
                  <button
                    className={`btn btn-sm ${sdkTab === "express" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setSdkTab("express")}
                  >
                    Express Middleware
                  </button>
                </div>

                <button className="btn btn-outline btn-sm" onClick={() => copyToClipboard(sdkSnippets[sdkTab])}>
                  <Copy size={14} /> {copied ? "Copied Code!" : "Copy Code"}
                </button>
              </div>

              <div className="code-block">
                <pre style={{ margin: 0 }}>{sdkSnippets[sdkTab]}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Feature Matrix (3x2 Grid) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
                marginBottom: "16px",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Session Management</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              High-performance HttpOnly cookie and Bearer token sessions with instant single or bulk device revocation.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
                marginBottom: "16px",
              }}
            >
              <KeyRound size={22} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>API Key Service</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Issue and validate custom API keys (`authify_live_...`) for downstream microservices and external projects.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
                marginBottom: "16px",
              }}
            >
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Prisma & PostgreSQL</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Type-safe relational database queries powered by Prisma ORM and hosted on Neon PostgreSQL database.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
                marginBottom: "16px",
              }}
            >
              <Mail size={22} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Verification & Recovery</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Single-use email verification tokens and 1-hour expiration password reset flows.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
                marginBottom: "16px",
              }}
            >
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Enterprise Security</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Bcrypt password hashing (12 rounds), SHA-256 token hashing, Zod validation, and IP rate limiting.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-violet-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-violet)",
                marginBottom: "16px",
              }}
            >
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Render Blueprint Ready</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Pre-configured `render.yaml` blueprint file for zero-config one-click cloud deployments on Render.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "32px 24px", marginTop: "auto" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          <div>© {new Date().getFullYear()} MyAuthify — BetterAuth Inspired Authentication Engine.</div>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="http://localhost:5000/api/v1/health" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              API Status
            </a>
            <a href="https://render.com" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Render Deploy Guide
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
