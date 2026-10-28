import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { paidDonation, stripeClient } from "@/lib/submissions/stripe";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

export default async function ThankYou({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: id } = await searchParams;
  let paid = false;
  if (process.env.FTR_STANDALONE === "true" && id?.startsWith("cs_") && id.length < 200) {
    try { paid = !!paidDonation(await stripeClient().checkout.sessions.retrieve(id)); } catch { /* Show the neutral message below. */ }
  }
  return <Container className="max-w-[760px] py-24 text-center">
    <h1 className="text-4xl font-medium">{paid ? "Thank you for supporting Flag to Remember." : "Your donation status"}</h1>
    <p className="mt-6 text-lg leading-relaxed">{paid
      ? "Your payment was received. Thank you for helping us honor the fallen and support their families."
      : "We couldn’t confirm a completed payment on this page. Please check your email for a receipt before trying again, or contact anthony@flagtoremember.com."}</p>
    <Link href="/" className="mt-8 inline-block underline underline-offset-4">Return home</Link>
  </Container>;
}
