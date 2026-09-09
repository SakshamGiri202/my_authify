import bcrypt from "bcrypt";
import crypto from "crypto";
const SALT_ROUNDS = 12;
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
}
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export function generateApiKey() {
    const rawKey = `authify_live_${crypto.randomBytes(24).toString("hex")}`;
    const prefix = rawKey.substring(0, 16);
    const keyHash = hashToken(rawKey);
    return { apiKey: rawKey, keyHash, prefix };
}
//# sourceMappingURL=crypto.js.map