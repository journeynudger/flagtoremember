import Stripe from "stripe";
import { required } from "./airtable";
import type { Donation } from "./mapping";

export const stripeClient = () => new Stripe(required("STRIPE_SECRET_KEY"));
export const STRIPE_PURPOSE = "ftr-website-donation";

export function donationAmount(amount: unknown): number | null {
  if (typeof amount !== "string" || !/^\d{1,6}(\.\d{1,2})?$/.test(amount.trim())) return null;
  const cents = Math.round(Number(amount) * 100);
  return Number.isSafeInteger(cents) && cents >= 100 && cents <= 99_999_999 ? cents : null;
}

/** Only paid sessions created by this site's checkout are recorded. */
export function paidDonation(session: Stripe.Checkout.Session): Donation | null {
  if (session.metadata?.purpose !== STRIPE_PURPOSE || session.mode !== "payment" ||
    session.payment_status !== "paid" || session.currency !== "usd" || !session.amount_total || session.amount_total < 100) return null;
  const email = session.customer_details?.email || session.customer_email;
  if (!email) throw new Error("Paid donation is missing the donor email");
  return {
    id: session.id, email, name: session.customer_details?.name || "", phone: session.customer_details?.phone || "",
    amountCents: session.amount_total,
  };
}
