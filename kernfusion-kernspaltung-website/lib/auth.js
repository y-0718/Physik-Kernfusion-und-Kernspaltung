import { parse, serialize } from "cookie";
import crypto from "node:crypto";

const COOKIE_NAME = "fusion_admin";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret-change-me";
}

export function signSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const payload = `${expires}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySession(req) {
  const cookies = parse(req.headers.cookie || "");
  const value = cookies[COOKIE_NAME];
  if (!value) return false;

  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;

  const expected = crypto.createHmac("sha256", getSecret()).update(expires).digest("hex");
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function sessionCookie(value) {
  return serialize(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearSessionCookie() {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
