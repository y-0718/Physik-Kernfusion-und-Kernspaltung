import { getSupabase } from "../lib/supabase.js";
import { verifySession } from "../lib/auth.js";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanPage(input) {
  const title = String(input.title || "").trim();
  return {
    title,
    slug: slugify(input.slug || title),
    summary: String(input.summary || "").trim(),
    body: String(input.body || "").trim(),
    image_url: String(input.image_url || "").trim(),
    video_url: String(input.video_url || "").trim(),
    sort_order: Number(input.sort_order || 0),
    is_published: Boolean(input.is_published)
  };
}

function readBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body || {};
}

export default async function handler(req, res) {
  const supabase = getSupabase();

  if (req.method === "GET") {
    const includeDrafts = req.query?.admin === "true";
    if (includeDrafts && !verifySession(req)) {
      res.status(401).json({ error: "Nicht angemeldet." });
      return;
    }

    let query = supabase
      .from("presentation_pages")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!includeDrafts) query = query.eq("is_published", true);

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json(data);
    return;
  }

  if (!verifySession(req)) {
    res.status(401).json({ error: "Nicht angemeldet." });
    return;
  }

  if (req.method === "POST") {
    const page = cleanPage(readBody(req));
    if (!page.title || !page.slug) {
      res.status(400).json({ error: "Titel und Slug sind erforderlich." });
      return;
    }
    const { data, error } = await supabase.from("presentation_pages").insert(page).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json(data);
    return;
  }

  if (req.method === "PUT") {
    const { id, ...body } = readBody(req);
    if (!id) {
      res.status(400).json({ error: "ID fehlt." });
      return;
    }
    const page = cleanPage(body);
    const { data, error } = await supabase.from("presentation_pages").update(page).eq("id", id).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json(data);
    return;
  }

  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (!id) {
      res.status(400).json({ error: "ID fehlt." });
      return;
    }
    const { error } = await supabase.from("presentation_pages").delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
