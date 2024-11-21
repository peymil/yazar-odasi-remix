import * as crypto from "crypto";

export function createSessionToken() {
  return crypto.randomBytes(20).toString("base64");
}

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("base64");
}

export function verifyPassword(password: string, hash: string) {
  return hashPassword(password) === hash;
}


