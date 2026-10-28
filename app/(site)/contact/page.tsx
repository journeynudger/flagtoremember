import type { Metadata } from "next";
import Form from "@/components/forms/Form";
import { Container, Toggle } from "@/components/ui";
import { contact, site } from "@/lib/content";
import { contactDef } from "@/lib/forms/schema";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Flag to Remember about sponsoring a flag, partnerships, or a registered name. Frequently asked questions.",
};

export default function ContactPage() {
  return (
    <Container className="pb-24 pt-10 sm:pt-16">
      <div className="mx-auto max-w-[640px] text-center">
        <p className="accent text-xl sm:text-2xl">{contact.eyebrow}</p>
        <h1 className="mt-1 text-6xl font-medium text-ink-2 sm:text-[4.375rem]">{contact.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">{contact.lede}</p>
      </div>
      <div className="mx-auto mt-10 max-w-[640px]">
        <Form def={contactDef} look="pill" />
        <p className="mt-8 text-center text-base text-ink-2">
          Or reach us directly:
          <br />
          <a href={`mailto:${site.email}`} className="font-medium text-ink underline underline-offset-2">{site.email}</a>
          <br />
          <a href={`tel:${site.phone.tel}`} className="font-medium text-ink underline underline-offset-2">{site.phone.display}</a>
        </p>
      </div>

      <section id="faq" className="mx-auto mt-24 max-w-[760px] scroll-mt-24" aria-labelledby="faq-title">
        <div className="text-center">
          <p className="accent text-xl leading-tight sm:text-2xl">
            You’ve Got Questions,
            <br />
            Here Are Some Answers
          </p>
          <h2 id="faq-title" className="mt-3 text-6xl font-medium text-ink-2 sm:text-[4.375rem]">{contact.faqTitle}</h2>
        </div>
        <div className="mt-8 space-y-1">
          {contact.faq.map((item) => (
            <Toggle key={item.q} title={item.q} size="md" level={3} variant="bare">
              <div className="space-y-3 text-base leading-relaxed text-ink-2 sm:text-lg">
                {item.a.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Toggle>
          ))}
        </div>
      </section>
    </Container>
  );
}
