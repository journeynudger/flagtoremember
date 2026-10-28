import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { stripeClient, donationAmount, STRIPE_PURPOSE } from "@/lib/submissions/stripe";
import { assertReady } from "@/lib/submissions/standalone";
import { required } from "@/lib/submissions/airtable";
import { verifyCaptcha } from "@/lib/submissions/captcha";

export const maxDuration = 60;
const fail = (message: string, status: number) => NextResponse.json({ ok: false, message }, { status });

export async function POST(request: Request) {
  if (process.env.FTR_STANDALONE !== "true") return fail("Donation checkout is not available here yet.", 503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail("Please refresh the page and try again.", 403);
  const raw = await request.text();
  if (raw.length > 10_000) return fail("Please check your donation and try again.", 413);
  let body;
  try { body = JSON.parse(raw); } catch { return fail("Please check your donation and try again.", 400); }
  if (!body || typeof body !== "object") return fail("Please check your donation and try again.", 400);
  const cents = donationAmount(body.amount);
  if (!cents) return fail("Enter a donation of at least $1, with no more than two decimal places.", 422);
  if (typeof body.requestId !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(body.requestId)) {
    return fail("Please refresh the page and try again.", 400);
  }
  try {
    assertReady(5);
    required("STRIPE_WEBHOOK_SECRET");
    if (!await verifyCaptcha(body.captcha)) return fail("We couldn’t confirm you’re not a robot. Please try again.", 422);
    const site = new URL(process.env.SITE_URL || "https://flagtoremember.com").origin;
    const key = createHash("sha256").update(`donation:${body.requestId}:${cents}`).digest("hex");
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment", submit_type: "donate", allowed_payment_method_types: ["card"],
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: cents, product_data: { name: "Donation to Flag to Remember Foundation" } } }],
      success_url: `${site}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/donate`, metadata: { purpose: STRIPE_PURPOSE },
      payment_intent_data: { metadata: { purpose: STRIPE_PURPOSE } },
      billing_address_collection: "required", phone_number_collection: { enabled: true },
    }, { idempotencyKey: key });
    if (!session.url) throw new Error("Missing Checkout URL");
    return NextResponse.json({ ok: true, url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("[donations] Checkout could not be started");
    return fail("We couldn’t open the donation checkout. Please try again or email anthony@flagtoremember.com.", 503);
  }
}
