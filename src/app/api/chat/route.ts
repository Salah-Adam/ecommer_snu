import { db } from "@/lib/db";

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key && !process.env.GROQ_API_KEY) return Response.json({ text: "The assistant is not configured yet.", products: [] });

  const { messages } = (await req.json()) as { messages: Msg[] };
  const history = (messages ?? []).slice(-10).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.text).slice(0, 1000) }] }));

  const products = await db.product.findMany({
    where: { published: true },
    select: { slug: true, name: true, price: true, stock: true, images: true, highlights: true, brand: { select: { name: true } }, category: { select: { name: true } } },
  });
  const catalog = products
    .map((p) => `${p.slug} | ${p.name} | ${p.brand.name} | ${p.category.name} | $${Number(p.price)} | ${p.stock > 0 ? "in stock" : "sold out"} | ${p.highlights.join("; ")}`)
    .join("\n");

  const system = `You are the friendly shopping assistant of somStore, an electronics shop in Somalia (prices in USD; payment by EVC Plus, ZAAD, Sahal, eDahab or cash on delivery; delivery to Mogadishu, Hargeisa, Garowe, Bosaso, Kismayo, Baidoa, Galkayo, Beledweyne; free delivery in Mogadishu over $300).
Only recommend products from this catalog (slug | name | brand | category | price | stock | highlights):
${catalog}
Rules: answer briefly (max 4 sentences), reply in the user's language (Somali or English), respect the user's budget, never invent products or prices. When you recommend products, add their slugs at the very end like [[slug-1]] [[slug-2]] (max 3). Politely decline unrelated topics.`;

  const raw = (await askGroq(system, messages ?? [])) ?? (key ? await askGemini(key, system, history) : null);
  if (raw == null) return Response.json({ text: "Sorry, I'm having trouble right now. Please try again in a moment.", products: [] });

  const slugs = [...raw.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map((m) => m[1]);
  const picks = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is (typeof products)[number] => !!p)
    .slice(0, 3)
    .map((p) => ({ slug: p.slug, name: p.name, price: Number(p.price), image: p.images[0] ?? "" }));

  const text = raw.replace(/\[\[[a-z0-9-]+\]\]/g, "").replace(/\*\*|__/g, "").trim();
  return Response.json({ text: text || "Could you tell me a bit more about what you need and your budget?", products: picks });
}

/** Groq (fast, OpenAI-compatible). Returns null on failure so Gemini can take over. */
async function askGroq(system: string, messages: Msg[]): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      reasoning_effort: "low",
      temperature: 0.4,
      max_tokens: 1024,
      messages: [{ role: "system", content: system }, ...messages.slice(-10).map((m) => ({ role: m.role, content: String(m.text).slice(0, 1000) }))],
    }),
  });
  if (!res.ok) { console.error("[chat] groq", res.status, (await res.text()).slice(0, 200)); return null; }
  const text: string = (await res.json()).choices?.[0]?.message?.content ?? "";
  return text.trim() ? text : null;
}

/** Gemini backup with model fallback. */
async function askGemini(key: string, system: string, history: unknown[]): Promise<string | null> {
  for (const model of [process.env.GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-flash-latest"].filter(Boolean)) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: history, generationConfig: { temperature: 0.4, maxOutputTokens: 1024 } }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    }
    console.error("[chat] gemini", model, res.status);
  }
  return null;
}
