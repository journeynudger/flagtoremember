import type { Metadata } from "next";
import Image from "next/image";
import OpenOnHash from "@/components/OpenOnHash";
import { Container, Pill, Title, Toggle } from "@/components/ui";
import { flagAnchor, flags, type Flag } from "@/lib/content";

export const metadata: Metadata = {
  title: "Flag Registry",
  description: "Every Flag to Remember: its number, Flag Host, location and dedication date.",
};

function Hosts({ flag }: { flag: Flag }) {
  const hosts = flag.hosts ?? (flag.host ? [{ name: flag.host, url: flag.hostUrl }] : []);
  return (
    <>
      {hosts.map((h, i) => (
        <span key={h.name}>
          {i > 0 && " & "}
          {h.url ? (
            <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-teal-edge underline underline-offset-2">
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
    <Container className="pb-24 pt-10 sm:pt-16">
      <OpenOnHash />
      <Title plain="Flag" accent="Registry" />
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
        Every flag has a unique serial number. Open one to see its Flag Host, where it hangs and when it was dedicated.
      </p>

      <div className="mt-6 space-y-1">
        {flags.map((f) => {
          const rows: [string, React.ReactNode][] = [];
          if (f.host || f.hosts) rows.push(["Hosted by", <Hosts key="h" flag={f} />]);
          if (f.city) rows.push(["Location", `${f.city}, ${f.stateCode}`]);
          rows.push(["Dedicated on", f.dedicated]);
          if (f.address) rows.push(["Address", f.address]);
          if (f.hostPhone)
            rows.push(["Host phone", <a key="p" href={`tel:+1${f.hostPhone.replace(/\D/g, "")}`} className="text-teal-edge underline underline-offset-2">{f.hostPhone}</a>]);
          return (
            <Toggle key={f.number} id={flagAnchor(f.number)} title={`Flag ${f.number}`} size="md" variant="bare">
              <div className={`grid gap-6 ${f.image ? "md:grid-cols-[17rem_1fr] md:gap-8" : ""}`}>
                {f.image && (
                  <a href={f.image.src} className="block max-w-[17rem]" aria-label={`Open the Flag ${f.number} flyer full size`}>
                    <Image src={f.image.src} alt={f.image.alt} width={f.image.width} height={f.image.height} sizes="17rem" className="h-auto w-full rounded-[12px]" />
                  </a>
                )}
                <div className="min-w-0">
                  {f.title && <h3 className="text-2xl font-medium">{f.title}</h3>}
                  {f.description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">{f.description}</p>}
                  <dl className="mt-3 space-y-2 text-base sm:text-lg">
                    {rows.map(([k, v]) => (
                      <div key={k}>
                        <dt className="inline font-semibold">{k}: </dt>
                        <dd className="inline break-words text-ink-2">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {f.memorial && (
                    <section className="mt-6 border-t border-line pt-5" aria-label={`In memory of ${f.memorial.name}`}>
                      <div className="flex flex-col gap-5 sm:flex-row">
                        {f.memorial.image && (
                          <Image src={f.memorial.image.src} alt={f.memorial.image.alt} width={f.memorial.image.width} height={f.memorial.image.height} className="h-auto w-28 shrink-0 rounded-[12px] object-cover" />
                        )}
                        <div className="min-w-0">
                          <h3 className="text-xl font-medium">
                            In Memory of <span className="accent">{f.memorial.fullName ?? f.memorial.name}</span>
                          </h3>
                          <p className="mt-0.5 text-sm text-muted">{f.memorial.lifespan}</p>
                          {f.memorial.bio && <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-2">{f.memorial.bio}</p>}
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </Toggle>
          );
        })}
      </div>

      <div className="mt-16 rounded-[25px] bg-soft px-6 py-10 text-center sm:px-10">
        <h2 className="text-3xl font-medium">
          Bring a flag to your <span className="accent">community</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-ink-2 sm:text-lg">Flag Hosts display a flag as a lasting tribute to our heroes.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Pill href="/process">How it works</Pill>
          <Pill href="/contact" variant="gray">Sponsor a Flag</Pill>
        </div>
      </div>
    </Container>
  );
}
