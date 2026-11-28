import { randomBytes } from "node:crypto";

export function generateTemporaryPassword() {
    return randomBytes(12).toString("base64url");
}
