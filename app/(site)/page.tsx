import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import FlagMap from "@/components/FlagMap";
import MediaCard from "@/components/MediaCard";
import { Container, Pill } from "@/components/ui";
import { flags, flagsByState, gallery, home } from "@/lib/content";

export default function HomePage() {
  const states = flagsByState();
  const [lead, middle, end] = home.missionParts;
  const counters = [
    { value: String(flags.length), label: "Number of Flags", color: "text-orange" },
    { value: home.namesAdded, label: "Names Added", color: "text-navy" },
    { value: String(states.length), label: "States", color: "text-flag-red" },
  ];

  return (
    <>
      {/* Hero: the flags on the pole, as on the original home page. */}
      <section className="on-dark relative isolate flex min-h-[min(88svh,52rem)] items-center justify-center overflow-hidden bg-hero text-center text-white">
        <Image src={home.hero.image.src} alt={home.hero.image.alt} fill priority sizes="100vw" className="-z-10 object-cover object-[30%_center]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/35" />
        <div className="px-5 pb-10 pt-28">
          <p className="accent text-xl sm:text-[1.5625rem]">{home.hero.eyebrow}</p>
          <h1 className="mt-1 text-[3.25rem] font-medium leading-[1] sm:text-7xl lg:text-[5.5rem]">{home.hero.title}</h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-14">
            <Pill href="/add-name" variant="white" size="lg">Add a Name</Pill>
            <Pill href="/donate" variant="glass" size="lg">
              <span className="px-4">Donate</span>
            </Pill>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 text-center sm:py-24">
        <Container className="max-w-[1000px]">
          <h2 className="accent text-4xl sm:text-[2.75rem]">{home.missionTitle}</h2>
          <p className="mx-auto mt-8 max-w-[52rem] text-[1.375rem] font-medium leading-snug sm:text-[1.75rem]">
            {lead} <span className="text-[#6b6b6b]">{middle}</span> {end}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Pill href="/about">Learn More</Pill>
            <Pill href="/contact">Sponsor a Flag</Pill>
          </div>
        </Container>
      </section>

      {/* The full-width band of Flag 005, fading to gray as on the original. */}
      <div className="relative h-[clamp(16rem,39vw,31rem)] overflow-hidden bg-[#a7a9ad]">
        <Image src={home.band.src} alt={home.band.alt} fill sizes="100vw" className="object-cover object-[center_88%]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-[#a7a9ad]/0 via-[#a7a9ad]/85 to-[#a7a9ad]" />
      </div>

      {/* Current Flags */}
      <section className="pb-20 pt-24 sm:pb-28 sm:pt-32" aria-labelledby="current-flags">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="current-flags" className="text-[2.75rem] font-medium leading-none sm:text-[3.125rem]">{home.flagsIntro.title}</h2>
            <p className="mt-4 text-lg leading-snug sm:text-xl">{home.flagsIntro.text}</p>
            <h3 className="mt-10 text-2xl font-medium">{home.registryCta.title}</h3>
            <p className="mt-2 text-lg leading-snug sm:text-xl">{home.registryCta.text}</p>
            <div className="mt-6">
              <Pill href={home.registryCta.href}>{home.registryCta.label}</Pill>
            </div>
          </div>
          <div className="mt-16">
            <FlagMap states={states} />
          </div>

          <dl className="mt-24 grid gap-12 text-center sm:grid-cols-3 sm:gap-6">
            {counters.map((c) => (
              <div key={c.label} className="flex flex-col-reverse">
                <dt className="mt-3 text-lg text-ink-2">{c.label}</dt>
                <dd className={`text-6xl tabular-nums sm:text-[3.25rem] md:text-6xl lg:text-7xl ${c.color}`}>{c.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Sponsors */}
      <section className="pb-24" aria-labelledby="sponsors">
        <Container>
          <h2 id="sponsors" className="text-center text-3xl font-medium leading-tight sm:text-[2.25rem]">
            {home.sponsorsTitle[0]} <span className="text-[#6b6b6b]">{home.sponsorsTitle[1]}</span>
          </h2>
          <div className="mx-auto mt-12 max-w-[1000px] px-10">
            <Carousel label="Our sponsors" itemClass="basis-full sm:basis-[calc((100%-2.5rem)/3)] lg:basis-[calc((100%-6.25rem)/6)]" arrows="sides" dots="flag">
              {home.sponsors.map((s) => (
                <div key={s.name} className="flex h-32 items-center justify-center">
                  <Image src={s.src} alt={s.name} width={s.width} height={s.height} sizes="160px" loading="eager" className="max-h-28 w-auto max-w-[9.5rem] object-contain" />
                </div>
              ))}
            </Carousel>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="pb-24" aria-labelledby="gallery">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <h2 id="gallery" className="text-4xl font-medium sm:text-5xl">Gallery</h2>
            <div className="flex items-center gap-4">
              <Image src="/images/logo.png" alt="" width={68} height={68} className="hidden size-14 sm:block sm:size-[68px]" />
              <Link href="/gallery" className="text-xl font-medium underline underline-offset-4 sm:text-2xl">See All</Link>
            </div>
          </div>
          <div className="mt-10">
            <Carousel label="Gallery" itemClass="basis-[82%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]">
              {gallery.media.slice(1).map((m) => (
                <MediaCard key={m.url} item={m} />
              ))}
            </Carousel>
          </div>
        </Container>
      </section>
    </>
  );
}
