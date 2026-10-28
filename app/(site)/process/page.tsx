import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, Eyebrow, PageHeader } from "@/components/ui";
import { processPage as page } from "@/lib/content";

export const metadata: Metadata = {
  title: "Process",
  description: "How a Flag to Remember is made: Name Donors, Flag Hosts, building the flag, and its dedication. Sizes and donation costs.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader eyebrow="Process" title={page.title}>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {page.steps.map((s, i) => (
            <li key={s.title}>
              <a href={`#step-${i + 1}`} className="flex h-full items-center gap-3 rounded-md border border-line bg-white px-4 py-3 hover:border-navy">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-paper">{i + 1}</span>
                <span className="font-medium">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </PageHeader>

      <Container className="py-16 sm:py-24">
        <div className="space-y-20 sm:space-y-28">
          {page.steps.map((s, i) => (
            <section key={s.title} id={`step-${i + 1}`} className="grid scroll-mt-28 gap-8 lg:grid-cols-[14rem_1fr] lg:gap-16">
              <div>
                <p className="font-serif text-7xl leading-none text-navy sm:text-8xl" aria-hidden>{String(i + 1).padStart(2, "0")}</p>
                <Eyebrow>{s.label}</Eyebrow>
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">{s.title}</h2>
                <div className="mt-6 max-w-3xl space-y-5 text-lg leading-relaxed">
                  {s.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {s.list && (
                  <div className="mt-8">
                    <h3 className="font-semibold">{s.listTitle}</h3>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {s.list.map((l) => (
                        <li key={l} className="flex gap-3 rounded-md bg-white px-4 py-3 ring-1 ring-line">
                          <span aria-hidden className="text-red">★</span>
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.features && (
                  <dl className="mt-8 grid gap-4 md:grid-cols-3">
                    {s.features.map((f) => (
                      <div key={f.title} className="rounded-lg border border-line bg-white p-6">
                        <dt className="font-serif text-2xl">{f.title}</dt>
                        <dd className="mt-3 leading-relaxed text-muted">{f.text}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </section>
          ))}
        </div>
      </Container>

      <section id="sizes" className="scroll-mt-24 border-t border-line bg-white py-20 sm:py-28" aria-labelledby="pricing">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow>Sizes</Eyebrow>
            <h2 id="pricing" className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{page.pricing.title}</h2>
            <p className="mt-5 text-lg font-medium">{page.pricing.lede}</p>
            <p className="mt-3 text-lg leading-relaxed text-muted">{page.pricing.text}</p>
          </div>
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {page.pricing.sizes.map((s) => (
              <li key={s.name} className="flex flex-col overflow-hidden rounded-lg border border-line bg-paper">
                <div className="relative aspect-[4/3] bg-night">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-serif text-3xl">{s.name}</h3>
                  <dl className="mt-5 divide-y divide-line border-y border-line">
                    {s.specs.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted">{k}</dt>
                        <dd className="font-semibold tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 flex-1 leading-relaxed text-muted">{s.text}</p>
                  <p className="mt-6 flex items-baseline gap-3">
                    <span className="font-serif text-4xl tabular-nums">{s.price}</span>
                    <span className="text-sm text-muted">{s.priceNote}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-5 rounded-lg border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h3 className="font-serif text-2xl">{page.pricing.nonprofit.title}</h3>
              <p className="mt-1 text-muted">{page.pricing.nonprofit.text}</p>
            </div>
            <Button href={page.pricing.nonprofit.href}>{page.pricing.nonprofit.label}</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
