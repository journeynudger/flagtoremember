import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui";
import { donate, site, wordpressOrigin } from "@/lib/content";

export const metadata: Metadata = {
  title: "Donate",
  description: donate.text,
};

export default function DonatePage() {
  const checkout = `${wordpressOrigin()}${donate.checkoutPath}`;
  return (
    <section className="relative isolate overflow-hidden bg-night text-paper">
      <Image src="/images/hero-flag-005.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover object-right opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/95 to-night/60" />
      <Container className="py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">Donate</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.08] tracking-tight sm:text-6xl">{donate.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-paper/85 sm:text-xl">{donate.text}</p>
        </div>
        <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-paper/5 p-6 ring-1 ring-paper/15">
            <p className="font-serif text-5xl tabular-nums">$15</p>
            <p className="mt-2 text-paper/80">sews one name onto a flag</p>
          </div>
          <div className="rounded-lg bg-paper/5 p-6 ring-1 ring-gold/50">
            <p className="font-serif text-5xl tabular-nums text-gold-soft">$30</p>
            <p className="mt-2 text-paper/80">honors another family’s fallen hero as well</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href={checkout} className="inline-flex items-center justify-center rounded-md bg-gold px-8 py-4 text-lg font-semibold text-ink transition-colors hover:bg-gold-soft">
            {donate.checkoutLabel}
          </a>
          <p className="text-sm text-paper/70">{donate.checkoutNote}</p>
        </div>
        <p className="mt-12 text-sm text-paper/65">
          Flag to Remember is a 501(c)(3) nonprofit, EIN #{site.ein}. Questions about a gift:{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-2">{site.email}</a>
        </p>
      </Container>
    </section>
  );
}
