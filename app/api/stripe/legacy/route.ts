import { forwardLegacyStripe, legacyStripeActive } from "@/lib/submissions/legacy-stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!legacyStripeActive()) return new Response("Legacy callback retired", { status: 410 });
  const signature = request.headers.get("stripe-signature");
  if (!signature || signature.length > 4096) return new Response("Missing signature", { status: 400 });
  if (Number(request.headers.get("content-length")) > 1_000_000) return new Response(null, { status: 413 });
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length > 1_000_000) return new Response(null, { status: 413 });
  try {
    const result = await forwardLegacyStripe(body, signature);
    return new Response(new Uint8Array(result.body), {
      status: result.status,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  } catch {
    return new Response("Legacy callback temporarily unavailable", { status: 502 });
  }
}
