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

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && crypto.timingSafeEqual(aBuf, bBuf);
}

// بيدعم أكتر من حساب أدمن مع بعض عن طريق متغير البيئة ADMIN_USERS
// الصيغة: "user1:pass1,user2:pass2,user3:pass3"
// (لسه بيدعم الصيغة القديمة ADMIN_USERNAME/ADMIN_PASSWORD لحساب واحد لو ADMIN_USERS مش موجود)
function getAdminAccounts(): { username: string; password: string }[] {
  const usersEnv = process.env.ADMIN_USERS;
  if (usersEnv) {
    return usersEnv
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [username, ...rest] = pair.split(":");
        return { username: username.trim(), password: rest.join(":").trim() };
      })
      .filter((acc) => acc.username && acc.password);
  }

  const singleUsername = process.env.ADMIN_USERNAME;
  const singlePassword = process.env.ADMIN_PASSWORD;
  if (singleUsername && singlePassword) {
    return [{ username: singleUsername, password: singlePassword }];
  }

  return [];
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const accounts = getAdminAccounts();
  let matched = false;

  for (const account of accounts) {
    const usernameMatches = safeEqual(username, account.username);
    const passwordMatches = safeEqual(password, account.password);
    if (usernameMatches && passwordMatches) matched = true;
  }

  return matched;
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
