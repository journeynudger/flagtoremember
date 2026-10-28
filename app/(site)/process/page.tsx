import type { Metadata } from "next";
import Image from "next/image";
import OpenOnHash from "@/components/OpenOnHash";
import { Container, Pill, Prose, Title, Toggle } from "@/components/ui";
import { processPage as page } from "@/lib/content";

export const metadata: Metadata = {
  title: "Process",
  description: "How a Flag to Remember is made: Name Donors, Flag Hosts, building the flag, and its dedication. Sizes and donation costs.",
};

export default function ProcessPage() {
  const p = page.pricing;
  return (
    <Container className="pb-24 pt-14 sm:pt-20">
      <OpenOnHash />
      <Title plain="Creating a Flag to" accent="Remember" />

      <div className="mt-8 space-y-3">
        {page.steps.map((s, i) => (
          <Toggle key={s.title} id={`step-${i + 1}`} title={`${s.label}: ${s.title}`}>
            <Prose>
              {s.paragraphs.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </Prose>
            {s.list && (
              <>
                <p className="mt-5 font-semibold">{s.listTitle}</p>
                <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-base text-ink-2 sm:grid-cols-2 sm:text-lg">
                  {s.list.map((l) => (
                    <li key={l} className="flex gap-2.5">
                      <span aria-hidden className="text-red-deep">•</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {s.features && (
              <dl className="mt-5 space-y-4 text-base sm:text-lg">
                {s.features.map((f) => (
                  <div key={f.title}>
                    <dt className="inline font-semibold">{f.title}: </dt>
                    <dd className="inline text-ink-2">{f.text}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Toggle>
        ))}

        <Toggle id="sizes" title={p.title}>
          <p className="text-lg font-semibold sm:text-xl">{p.lede}</p>
          <p className="mt-2 text-base leading-relaxed text-ink-2 sm:text-lg">{p.text}</p>
          <ul className="mt-8 grid gap-5 lg:grid-cols-3">
            {p.sizes.map((s) => (
              <li key={s.name} className="flex flex-col overflow-hidden rounded-[20px] bg-white">
                <div className="relative aspect-[4/3]">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 1024px) 300px, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-2xl font-medium">{s.name}</h3>
                  <dl className="mt-3 space-y-1 text-base">
                    {s.specs.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-line pb-1">
                        <dt className="text-muted">{k}</dt>
                        <dd className="font-medium tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-ink-2">{s.text}</p>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="text-3xl font-medium tabular-nums">{s.price}</span>
                    <span className="text-sm text-muted">{s.priceNote}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-4 rounded-[20px] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-xl font-medium">{p.nonprofit.title}</h3>
              <p className="mt-1 text-base text-ink-2">{p.nonprofit.text}</p>
            </div>
            <Pill href={p.nonprofit.href}>{p.nonprofit.label}</Pill>
          </div>
        </Toggle>
      </div>
    </Container>
  );
}
