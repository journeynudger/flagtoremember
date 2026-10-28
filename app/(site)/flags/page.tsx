import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, PageHeader } from "@/components/ui";
import { flagAnchor, flags, type Flag } from "@/lib/content";

export const metadata: Metadata = {
  title: "Flag Registry",
  description: "Every Flag to Remember: its number, Flag Host, location and dedication date.",
};

function Host({ flag }: { flag: Flag }) {
  const hosts = flag.hosts ?? (flag.host ? [{ name: flag.host, url: flag.hostUrl }] : []);
  return (
    <>
      {hosts.map((h, i) => (
        <span key={h.name}>
          {i > 0 && " & "}
          {h.url ? (
            <a href={h.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-navy">
              {h.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            h.name
          )}
        </span>
      ))}
    </>
  );
}

export default function FlagsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flag Registry"
        title="Every flag, and where to find it"
        lede="Each flag carries a unique serial number. Visit one, or follow its journey on social media with tags like #Flag001."
      >
        <nav aria-label="Jump to a flag" className="mt-8 flex flex-wrap gap-2">
          {flags.map((f) => (
            <a key={f.number} href={`#${flagAnchor(f.number)}`} className="rounded border border-line bg-white px-2.5 py-1.5 font-mono text-sm hover:border-navy">
              {f.number}
            </a>
          ))}
        </nav>
      </PageHeader>

      <Container className="py-16 sm:py-20">
        <ol className="space-y-6">
          {flags.map((f) => {
            const rows: [string, React.ReactNode][] = [];
            if (f.host || f.hosts) rows.push(["Hosted by", <Host key="h" flag={f} />]);
            if (f.city) rows.push(["Location", `${f.city}, ${f.state}`]);
            rows.push(["Dedicated on", f.dedicated]);
            if (f.address) rows.push(["Address", f.address]);
            if (f.hostPhone) rows.push(["Host phone", <a key="p" href={`tel:+1${f.hostPhone.replace(/\D/g, "")}`} className="underline decoration-line underline-offset-4 hover:decoration-navy">{f.hostPhone}</a>]);
            return (
              <li key={f.number} id={flagAnchor(f.number)} className="scroll-mt-28 overflow-hidden rounded-lg border border-line bg-white">
                <article className={`grid ${f.image ? "md:grid-cols-[minmax(0,18rem)_1fr]" : ""}`}>
                  {f.image && (
                    <a href={f.image.src} className="relative block aspect-[4/5] bg-night md:aspect-auto md:min-h-[22rem]" aria-label={`Open the Flag ${f.number} flyer full size`}>
                      <Image src={f.image.src} alt={f.image.alt} fill sizes="(min-width: 768px) 18rem, 100vw" className="object-cover" />
                    </a>
                  )}
                  <div className="min-w-0 p-6 sm:p-8">
                    <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-red">Flag</p>
                    <h2 className="mt-1 font-serif text-4xl tracking-tight sm:text-5xl">
                      {f.number}
                      {f.title && <span className="mt-2 block text-2xl text-muted sm:text-3xl">{f.title}</span>}
                    </h2>
                    {f.description && <p className="mt-4 max-w-2xl text-lg leading-relaxed">{f.description}</p>}
                    <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-[9rem_1fr]">
                      {rows.map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-sm font-semibold uppercase tracking-wider text-muted sm:pt-0.5">{k}</dt>
                          <dd className="-mt-2 min-w-0 break-words sm:mt-0">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {f.memorial && (
                      <section className="mt-8 border-t border-line pt-6" aria-label={`In memory of ${f.memorial.name}`}>
                        <div className="flex flex-col gap-6 sm:flex-row">
                          {f.memorial.image && (
                            <Image src={f.memorial.image.src} alt={f.memorial.image.alt} width={f.memorial.image.width} height={f.memorial.image.height} className="h-auto w-32 shrink-0 rounded-md object-cover" />
                          )}
                          <div className="min-w-0">
                            <h3 className="font-serif text-2xl">In memory of {f.memorial.fullName ?? f.memorial.name}</h3>
                            <p className="mt-1 text-muted">{f.memorial.lifespan}</p>
                            {f.memorial.bio && <p className="mt-4 max-w-3xl leading-relaxed">{f.memorial.bio}</p>}
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="mt-16 flex flex-col gap-6 rounded-lg bg-navy p-8 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl">Bring a flag to your community</h2>
            <p className="mt-2 max-w-xl text-paper/80">Flag Hosts display a flag as a lasting tribute to our heroes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/process" variant="ghost-dark">How it works</Button>
            <Button href="/contact" variant="gold">Sponsor a Flag</Button>
          </div>
        </div>
      </Container>
    </>
  );
}
