import { db } from "@/lib/db";

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ text: "The assistant is not configured yet.", products: [] });

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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-flash-latest"}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: history, generationConfig: { temperature: 0.4, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } } }),
    }
  );
  if (!res.ok) {
    console.error("[chat]", res.status, await res.text());
    return Response.json({ text: "Sorry, I'm having trouble right now. Please try again in a moment.", products: [] });
  }
  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  const slugs = [...raw.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map((m) => m[1]);
  const picks = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is (typeof products)[number] => !!p)
    .slice(0, 3)
    .map((p) => ({ slug: p.slug, name: p.name, price: Number(p.price), image: p.images[0] ?? "" }));

  const text = raw.replace(/\[\[[a-z0-9-]+\]\]/g, "").trim();
  return Response.json({ text: text || "Could you tell me a bit more about what you need and your budget?", products: picks });
}
