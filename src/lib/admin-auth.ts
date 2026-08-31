import crypto from "crypto";
import "server-only";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 ساعة

export type AdminRole = "admin" | "sales";
export type AdminAccount = { username: string; password: string; role: AdminRole };
export type AdminSession = { username: string; role: AdminRole; expiresAt: number };

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
// الصيغة: "user1:pass1,user2:pass2:sales,user3:pass3:admin"
// الـ role جزء اختياري في الآخر (admin أو sales) — لو اتشال بيبقى "admin" افتراضيًا
// (لسه بيدعم الصيغة القديمة ADMIN_USERNAME/ADMIN_PASSWORD لحساب أدمن واحد لو ADMIN_USERS مش موجود)
function parseAccount(pair: string): AdminAccount | null {
  const parts = pair.split(":").map((p) => p.trim());
  if (parts.length < 2) return null;

  const username = parts[0];
  const last = parts[parts.length - 1];
  const hasRoleSuffix = parts.length >= 3 && (last === "admin" || last === "sales");

  const role: AdminRole = hasRoleSuffix ? (last as AdminRole) : "admin";
  const passwordParts = hasRoleSuffix ? parts.slice(1, -1) : parts.slice(1);
  const password = passwordParts.join(":").trim();

  if (!username || !password) return null;
  return { username, password, role };
}

function getAdminAccounts(): AdminAccount[] {
  const usersEnv = process.env.ADMIN_USERS;
  if (usersEnv) {
    return usersEnv
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map(parseAccount)
      .filter((acc): acc is AdminAccount => acc !== null);
  }

  const singleUsername = process.env.ADMIN_USERNAME;
  const singlePassword = process.env.ADMIN_PASSWORD;
  if (singleUsername && singlePassword) {
    return [{ username: singleUsername, password: singlePassword, role: "admin" }];
  }

  return [];
}

export function checkAdminCredentials(username: string, password: string): AdminAccount | null {
  const accounts = getAdminAccounts();
  let matched: AdminAccount | null = null;

  for (const account of accounts) {
    const usernameMatches = safeEqual(username, account.username);
    const passwordMatches = safeEqual(password, account.password);
    if (usernameMatches && passwordMatches) matched = account;
  }

  return matched;
}

export function createSessionToken(account: {
  username: string;
  role: AdminRole;
}): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payloadObj: AdminSession = { username: account.username, role: account.role, expiresAt };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const signature = sign(payload);
  return { token: `${payload}.${signature}`, maxAge: SESSION_MAX_AGE_SECONDS };
}

// بيتحقق من صحة الجلسة (التوقيع + مدة الصلاحية) ويرجّع بياناتها (اسم المستخدم + الدور)
// لو الجلسة مش صالحة بيرجّع null
export function getSession(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const signatureBuf = Buffer.from(signature);
  const expectedSignatureBuf = Buffer.from(expectedSignature);
  if (
    signatureBuf.length !== expectedSignatureBuf.length ||
    !crypto.timingSafeEqual(signatureBuf, expectedSignatureBuf)
  ) {
    return null;
  }

  let parsed: AdminSession;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof parsed.username !== "string" ||
    (parsed.role !== "admin" && parsed.role !== "sales") ||
    !Number.isFinite(parsed.expiresAt)
  ) {
    return null;
  }

  if (Date.now() > parsed.expiresAt) return null;

  return parsed;
}

export function isValidSessionToken(token: string | undefined): boolean {
  return getSession(token) !== null;
}
