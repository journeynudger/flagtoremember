import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { donationNotifications } from "@/workflows/notifications";
import { stripeClient, paidDonation } from "@/lib/submissions/stripe";
import { required, saveBatch } from "@/lib/submissions/airtable";
import { donationBatch } from "@/lib/submissions/mapping";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (process.env.FTR_STANDALONE !== "true") return new Response("Not enabled", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const raw = await request.text();
  if (raw.length > 1_000_000) return new Response("Payload too large", { status: 413 });
  let event;
  try { event = stripeClient().webhooks.constructEvent(raw, signature, required("STRIPE_WEBHOOK_SECRET")); }
  catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }
  try {
    const donation = paidDonation(event.data.object);
    if (donation) {
      await saveBatch(donationBatch(donation));
      await start(donationNotifications, [donation]);
    }
    return NextResponse.json({ received: true });
  } catch {
    console.error("[donations] Paid donation could not be saved; Stripe should retry");
    return new Response("Please retry", { status: 503 });
  }
}
