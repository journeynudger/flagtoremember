import type { Metadata } from "next";
import { Container, pillClass } from "@/components/ui";
import { donate, site, wordpressOrigin } from "@/lib/content";

export const metadata: Metadata = {
  title: "Donate",
  description: donate.text,
};

export default function DonatePage() {
  const checkout = `${wordpressOrigin()}${donate.checkoutPath}`;
  return (
    <Container className="max-w-[920px] pb-24 pt-10 text-center sm:pt-16">
      <h1 className="text-[2.625rem] font-medium leading-tight sm:text-[3.125rem]">{donate.title}</h1>
      <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-relaxed text-ink-2 sm:text-lg">{donate.text}</p>

      <div className="mx-auto mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
        <div className="rounded-[25px] bg-soft px-6 py-7">
          <p className="text-5xl font-medium tabular-nums text-navy">$15</p>
          <p className="mt-2 text-base text-ink-2">sews one name onto a flag</p>
        </div>
        <div className="rounded-[25px] bg-soft px-6 py-7">
          <p className="text-5xl font-medium tabular-nums text-flag-red">$30</p>
          <p className="mt-2 text-base text-ink-2">honors another family’s fallen hero as well</p>
        </div>
      </div>

      <div className="mt-10">
        <a href={checkout} className={pillClass("red", "lg")}>
          <span className="px-6">{donate.checkoutLabel}</span>
        </a>
        <p className="mt-4 text-sm text-muted">{donate.checkoutNote}</p>
      </div>

      <p className="mt-14 text-sm leading-relaxed text-muted">
        Flag to Remember is a 501(c)(3) nonprofit, EIN #{site.ein}. Questions about a gift:{" "}
        <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-2">{site.email}</a>
      </p>
    </Container>
  );
}
