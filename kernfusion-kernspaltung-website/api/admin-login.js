import crypto from "node:crypto";
import { sessionCookie, signSession } from "../lib/auth.js";

function readBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body || {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    res.status(500).json({ error: "ADMIN_PASSWORD is not configured." });
    return;
  }

  const { password } = readBody(req);
  const given = Buffer.from(String(password || ""));
  const expected = Buffer.from(configuredPassword);

  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    res.status(401).json({ error: "Falsches Passwort." });
    return;
  }

  res.setHeader("Set-Cookie", sessionCookie(signSession()));
  res.status(200).json({ ok: true });
}
