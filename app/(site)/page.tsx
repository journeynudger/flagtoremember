import Image from "next/image";
import Link from "next/link";
import { Button, Container, Eyebrow } from "@/components/ui";
import MediaCard from "@/components/MediaCard";
import { about, flagAnchor, flags, flagsByState, gallery, home, site } from "@/lib/content";

export default function HomePage() {
  const states = flagsByState();
  const hosted = flags.filter((f) => f.state);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-night text-paper">
        <Image src={home.hero.image.src} alt={home.hero.image.alt} fill priority sizes="100vw" className="-z-10 object-cover object-[35%_center] opacity-80" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/10 md:bg-gradient-to-r md:from-night/95 md:via-night/65 md:to-night/0" />
        <Container className="flex min-h-[min(82svh,46rem)] flex-col justify-end pb-16 pt-28 sm:pb-24">
          <Eyebrow tone="dark">{home.hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">{home.hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85 sm:text-xl">{about.history.text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/add-name" variant="gold">Add a Name</Button>
            <Button href="/donate" variant="ghost-dark">Donate</Button>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-paper">
        <Container className="grid grid-cols-3">
          {[
            { value: home.namesAdded, label: "Names added" },
            { value: String(hosted.length), label: "Flags with a host" },
            { value: String(states.length), label: "Host states" },
          ].map((s) => (
            <div key={s.label} className="border-l border-line py-6 pl-3 first:border-l-0 first:pl-0 sm:py-8 sm:pl-8">
              <p className="font-serif text-3xl tabular-nums sm:text-5xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-medium uppercase leading-snug tracking-[0.12em] text-muted sm:text-sm sm:tracking-[0.14em]">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{home.missionTitle}</Eyebrow>
            <p className="mt-4 font-serif text-2xl leading-snug sm:text-4xl">{site.mission}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/about" variant="secondary">Learn More</Button>
              <Button href="/contact">Sponsor a Flag</Button>
            </div>
          </div>
          <figure className="relative aspect-[4/3] overflow-hidden rounded-lg bg-night">
            <Image src="/images/flags-on-pole.jpg" alt="Two flags flying from a flagpole against a pale sky." fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </figure>
        </Container>
      </section>

      <section className="border-y border-line bg-white py-20 sm:py-28" aria-labelledby="current-flags">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Flag Registry</Eyebrow>
              <h2 id="current-flags" className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{home.flagsIntro.title}</h2>
              <p className="mt-4 text-lg text-muted">{home.flagsIntro.text}</p>
            </div>
            <Button href="/flags" variant="secondary">See every flag</Button>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {states.map(({ state, flags: list }) => (
              <div key={state} className={list.length > 3 ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
                <h3 className="flex items-baseline justify-between border-b-2 border-ink pb-2">
                  <span className="font-serif text-2xl">{state}</span>
                  <span className="text-sm font-medium text-muted">{list.length} {list.length === 1 ? "flag" : "flags"}</span>
                </h3>
                <ul className={`divide-y divide-line ${list.length > 3 ? "sm:grid sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0" : ""}`}>
                  {list.map((f) => (
                    <li key={f.number} className={list.length > 3 ? "sm:border-b sm:border-line" : ""}>
                      <Link href={`/flags#${flagAnchor(f.number)}`} className="group flex gap-4 py-3.5">
                        <span className="w-12 shrink-0 pt-0.5 font-mono text-sm font-semibold text-red">{f.number}</span>
                        <span className="min-w-0">
                          <span className="block font-medium group-hover:underline">{f.host}</span>
                          <span className="block text-sm text-muted">
                            {f.city} · {f.dedicated === "Pending" ? "Dedication pending" : `Dedicated ${f.dedicated}`}
                          </span>
                          {f.memorial && <span className="mt-1 block text-sm text-ink">In memory of {f.memorial.name}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-6 rounded-lg bg-navy p-8 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl">{home.registryCta.title}</h3>
              <p className="mt-2 max-w-xl text-paper/80">{home.registryCta.text}</p>
            </div>
            <Button href={home.registryCta.href} variant="gold">{home.registryCta.label}</Button>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28" aria-labelledby="press">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Gallery</Eyebrow>
              <h2 id="press" className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">In the news</h2>
            </div>
            <Button href="/gallery" variant="secondary">See all</Button>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 lg:grid-cols-4">
            {gallery.media.slice(1, 5).map((m) => (
              <li key={m.url}><MediaCard item={m} /></li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-line bg-white py-20 sm:py-24" aria-labelledby="sponsors">
        <Container>
          <h2 id="sponsors" className="text-center font-serif text-3xl tracking-tight sm:text-4xl">{home.sponsorsTitle}</h2>
          <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {home.sponsors.map((s) => (
              <li key={s.name} className="flex h-24 items-center justify-center">
                <Image src={s.src} alt={s.name} width={s.width} height={s.height} sizes="160px" className="max-h-24 w-auto max-w-[9rem] object-contain" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-night py-20 text-paper sm:py-24">
        <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">Every name is a life lived.</h2>
            <p className="mt-4 text-lg text-paper/80">Registering a name is completely free. Donations keep the flags flying across the country.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/add-name" variant="gold">Add a Name</Button>
            <Button href="/donate" variant="ghost-dark">Donate</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
