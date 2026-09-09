import { validateSession } from "../core/session.js";
import { validateApiKey } from "../core/auth.js";
export async function requireAuth(req, res, next) {
    try {
        // 1. Check Cookies
        let sessionId = req.cookies?.sessionId;
        let rawToken = req.cookies?.rawToken;
        // Alternative single cookie format (sessionId.rawToken)
        if (!sessionId && req.cookies?.authify_session) {
            const parts = req.cookies.authify_session.split(".");
            if (parts.length === 2) {
                sessionId = parts[0];
                rawToken = parts[1];
            }
        }
        // 2. Check Authorization Header (Bearer token)
        const authHeader = req.headers.authorization;
        if (!sessionId && authHeader?.startsWith("Bearer ")) {
            const tokenStr = authHeader.substring(7).trim();
            if (tokenStr.startsWith("authify_live_")) {
                // API Key provided as Bearer token
                const { apiKey, user } = await validateApiKey(tokenStr);
                if (apiKey && user) {
                    req.apiKey = apiKey;
                    req.user = user;
                    return next();
                }
            }
            else if (tokenStr.includes(".")) {
                const parts = tokenStr.split(".");
                sessionId = parts[0];
                rawToken = parts[1];
            }
        }
        // 3. Check Custom API Key Header
        const apiKeyHeader = req.headers["x-api-key"];
        if (apiKeyHeader) {
            const { apiKey, user } = await validateApiKey(apiKeyHeader);
            if (apiKey && user) {
                req.apiKey = apiKey;
                req.user = user;
                return next();
            }
        }
        // Process Session Validation
        if (sessionId && rawToken) {
            const { session, user } = await validateSession(sessionId, rawToken);
            if (session && user) {
                req.session = session;
                req.user = user;
                return next();
            }
        }
        res.status(401).json({
            error: "UNAUTHORIZED",
            message: "Authentication required. Invalid or expired session/token.",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.js.map