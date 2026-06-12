import { clearSessionCookie } from "../lib/auth.js";

export default function handler(_req, res) {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.status(200).json({ ok: true });
}
