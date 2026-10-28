import type { Metadata } from "next";
import { Container, Eyebrow, PageHeader } from "@/components/ui";
import Form from "@/components/forms/Form";
import { contact, site } from "@/lib/content";
import { contactDef } from "@/lib/forms/schema";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Flag to Remember about sponsoring a flag, partnerships, or a registered name. Frequently asked questions.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow={contact.eyebrow} title={contact.title} lede={contact.lede} />
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="min-w-0 rounded-lg border border-line bg-paper p-0 sm:bg-white sm:p-8 lg:p-10">
          <Form def={contactDef} />
        </div>
        <aside className="space-y-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Email</h2>
            <a href={`mailto:${site.email}`} className="mt-2 block break-all text-lg underline decoration-line underline-offset-4 hover:decoration-navy">{site.email}</a>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Phone</h2>
            <a href={`tel:${site.phone.tel}`} className="mt-2 block text-lg underline decoration-line underline-offset-4 hover:decoration-navy">{site.phone.display}</a>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Follow</h2>
            <ul className="mt-2 space-y-1">
              {site.social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-lg underline decoration-line underline-offset-4 hover:decoration-navy">
                    {s.label}<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>

      <section id="faq" className="scroll-mt-24 border-t border-line bg-white py-16 sm:py-24" aria-labelledby="faq-title">
        <Container className="grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
          <div>
            <Eyebrow>{contact.faqLede}</Eyebrow>
            <h2 id="faq-title" className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{contact.faqTitle}</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {contact.faq.map((item) => (
              <details key={item.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden className="mt-1 text-2xl leading-none text-red transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="max-w-3xl space-y-3 pb-6 leading-relaxed text-muted">
                  {item.a.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
