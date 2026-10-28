import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import Form from "@/components/forms/Form";
import { addName, site } from "@/lib/content";
import { addNameDef } from "@/lib/forms/schema";

export const metadata: Metadata = {
  title: "Add a Name",
  description: addName.lede,
};

export default function AddNamePage() {
  const tapes = addName.nameTapes;
  const pageContent = {
    2: (
      <div className="mb-8 rounded-lg border border-line bg-paper p-5 sm:p-6">
        <p className="font-medium">{tapes.intro}</p>
        <Image src={tapes.image.src} alt={tapes.image.alt} width={tapes.image.width} height={tapes.image.height} sizes="(min-width: 1024px) 40rem, 100vw" className="mt-4 h-auto w-full rounded-md bg-white" />
        <p className="mt-4 leading-relaxed text-muted">{tapes.guidance}</p>
        <p className="mt-3 text-sm">
          <span className="font-semibold">Examples: </span>
          {tapes.examples.map((e, i) => (
            <span key={e}>
              {i > 0 && ", "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.95em] ring-1 ring-line">{e}</code>
            </span>
          ))}
        </p>
      </div>
    ),
    3: (
      <p className="mb-8 rounded-lg border border-line bg-paper p-5 leading-relaxed text-muted sm:p-6">
        {addName.donation.text} You can give on our <Link href="/donate" className="font-medium text-ink underline underline-offset-2">donation page</Link> after you register.
      </p>
    ),
  };

  return (
    <>
      <PageHeader eyebrow="Name Registration" title={addName.title} lede={addName.lede} />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="min-w-0 rounded-lg border-line sm:border sm:bg-white sm:p-8 lg:p-10">
          <Form
            def={addNameDef}
            pageContent={pageContent}
            afterSuccess={
              <div className="space-y-4 text-muted">
                <p>{addName.donation.text}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/donate" className="rounded-md bg-navy px-5 py-3 font-semibold text-paper hover:bg-navy-deep">Donate</Link>
                  <Link href="/name-registry" className="rounded-md border border-line bg-white px-5 py-3 font-semibold text-ink hover:border-navy">Name Registry</Link>
                </div>
              </div>
            }
          />
        </div>

        <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          <section>
            <h2 className="font-serif text-2xl">{addName.process.title}</h2>
            <ol className="mt-4 space-y-4">
              {addName.process.steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-paper">{i + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {addName.process.social}{" "}
              {site.social.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && " · "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{s.label}</a>
                </span>
              ))}
            </p>
          </section>

          <section className="rounded-lg border-l-4 border-red bg-white p-5 ring-1 ring-line">
            <h2 className="font-semibold">{addName.notes.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {addName.notes.text} <a href={`mailto:${site.email}`} className="break-all font-medium text-ink underline underline-offset-2">{site.email}</a>
            </p>
            <p className="mt-2 text-sm font-semibold">{addName.notes.warning}</p>
          </section>

          <section>
            <p className="text-sm leading-relaxed text-muted">{addName.process.profile}</p>
            <Image src={addName.process.profileImage.src} alt={addName.process.profileImage.alt} width={addName.process.profileImage.width} height={addName.process.profileImage.height} sizes="22rem" className="mt-4 h-auto w-full max-w-xs rounded-md" />
          </section>

          <section>
            <h2 className="font-semibold">{addName.hosts.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{addName.hosts.text}</p>
          </section>
        </aside>
      </Container>
    </>
  );
}
