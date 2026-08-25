import crypto from "crypto";
import "server-only";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 ساعة

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET غير موجود في متغيرات البيئة");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUsername || !expectedPassword) return false;

  const usernameBuf = Buffer.from(username);
  const expectedUsernameBuf = Buffer.from(expectedUsername);
  const passwordBuf = Buffer.from(password);
  const expectedPasswordBuf = Buffer.from(expectedPassword);

  const usernameMatches =
    usernameBuf.length === expectedUsernameBuf.length &&
    crypto.timingSafeEqual(usernameBuf, expectedUsernameBuf);
  const passwordMatches =
    passwordBuf.length === expectedPasswordBuf.length &&
    crypto.timingSafeEqual(passwordBuf, expectedPasswordBuf);

  return usernameMatches && passwordMatches;
}

export function createSessionToken(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${expiresAt}`;
  const signature = sign(payload);
  return { token: `${payload}.${signature}`, maxAge: SESSION_MAX_AGE_SECONDS };
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const signatureBuf = Buffer.from(signature);
  const expectedSignatureBuf = Buffer.from(expectedSignature);
  if (
    signatureBuf.length !== expectedSignatureBuf.length ||
    !crypto.timingSafeEqual(signatureBuf, expectedSignatureBuf)
  ) {
    return false;
  }

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
