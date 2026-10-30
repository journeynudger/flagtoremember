"use client";

import { useRef, useState } from "react";
import { pillClass } from "@/components/ui";
import { RECAPTCHA_SITE_KEY } from "@/lib/forms/schema";
import { mountCaptcha, type Captcha } from "./recaptcha";

export default function DonationForm() {
  const [amount, setAmount] = useState("30");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef("");
  const box = useRef<HTMLDivElement>(null);
  const captcha = useRef<Promise<Captcha> | null>(null);
  function warmUp() {
    if (!captcha.current && box.current) captcha.current = mountCaptcha(box.current, RECAPTCHA_SITE_KEY);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    warmUp();
    setSending(true);
    setError("");
    try {
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const token = captcha.current ? await (await captcha.current).token() : undefined;
      const response = await fetch("/api/donate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, requestId: requestId.current, captcha: token }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "We couldn’t open the donation checkout. Please try again.");
      const url = new URL(data.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") throw new Error("We couldn’t open the donation checkout. Please try again.");
      window.location.assign(url.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t open the donation checkout. Please try again.");
      setSending(false);
    }
  }
  return (
    <form onSubmit={submit} onFocus={warmUp} className="mx-auto max-w-md text-left">
      <label htmlFor="donation-amount" className="block text-base font-medium">Your donation (USD)</label>
      <div className="mt-2 flex items-center gap-3 rounded-md border border-[#bdbdbd] bg-white px-4">
        <span aria-hidden="true">$</span>
        <input id="donation-amount" type="number" min="1" max="999999.99" step="0.01" required
          inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={sending}
          className="w-full bg-transparent py-3 text-lg outline-none focus:ring-2 focus:ring-teal-edge/50" />
      </div>
      <div ref={box} />
      {error && <p role="alert" className="mt-4 text-sm text-flag-red">{error}</p>}
      <button type="submit" disabled={sending} className={`${pillClass("red", "lg")} mt-6 w-full disabled:opacity-60`}>
        {sending ? "Opening secure checkout…" : "Donate securely"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">You’ll enter your card details securely with Stripe.</p>
    </form>
  );
}
