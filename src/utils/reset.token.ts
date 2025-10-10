import { randomBytes, createHash } from "crypto";

export function createRawToken(bytes = 32) {
    return randomBytes(bytes).toString("hex");
}
export function hashToken(raw: string) {
    return createHash("sha256").update(raw).digest("hex");
}