import type { Metadata } from "next";
import Image from "next/image";
import { Container, Pill, Prose, Toggle } from "@/components/ui";
import Video from "@/components/Video";
import { about, home } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: about.history.text,
};

export default function AboutPage() {
  return (
    <>
      <section className="on-dark relative isolate flex min-h-[min(92svh,54rem)] items-center justify-center overflow-hidden bg-hero text-center text-white">
        <Image src={home.band.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />
        <div className="px-5 pb-10 pt-28">
          <p className="accent text-lg sm:text-[1.5625rem]">{about.eyebrow}</p>
          <h1 className="mx-auto mt-2 max-w-4xl text-[2.6rem] font-medium leading-[1.05] sm:text-6xl lg:text-[4.375rem]">{about.title}</h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
            <Pill href="/add-name" variant="white" size="lg">Add a Name</Pill>
            <Pill href="/donate" variant="glass" size="lg">
              <span className="px-4">Donate</span>
            </Pill>
          </div>
        </div>
      </section>

      <Container className="py-16 sm:py-20">
        <h2 className="text-4xl font-medium leading-tight sm:text-5xl">{about.intro.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-2 sm:text-lg">{about.intro.text}</p>

        <div className="mt-14 grid gap-6 border-t-2 border-ink/80 pt-6 md:grid-cols-2 md:gap-12">
          <h2 className="text-3xl font-medium">{about.history.title}</h2>
          <p className="text-base leading-relaxed text-ink-2 sm:text-lg">{about.history.text}</p>
        </div>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <Toggle title={about.founder.eyebrow} size="md" level={3}>
              <div className="flex flex-col gap-5 sm:flex-row">
                <Image src={about.founder.image.src} alt={about.founder.image.alt} width={about.founder.image.width} height={about.founder.image.height} sizes="10rem" className="h-auto w-36 shrink-0 rounded-[16px]" />
                <div className="min-w-0">
                  <h4 className="text-2xl font-medium">{about.founder.name}</h4>
                  <p className="text-sm text-muted">{about.founder.role}</p>
                  <Prose className="mt-3 sm:text-base">
                    {about.founder.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </Prose>
                </div>
              </div>
              <p className="mt-5 text-base leading-relaxed text-ink-2">{about.teamIntro}</p>
            </Toggle>
            <Toggle title={about.vision.eyebrow} size="md" level={3}>
              <p className="text-base leading-relaxed text-ink-2 sm:text-lg">{about.vision.text}</p>
              <p className="mt-3 font-medium">{about.vision.cta}</p>
            </Toggle>
            <div className="flex flex-col items-start gap-3 pt-4">
              <Pill href="/donate">Donate</Pill>
              <Pill href="/contact" variant="gray">Sponsor a Flag</Pill>
            </div>
          </div>
          <Video id={about.history.video.id} title={about.history.video.title} poster="/images/press/join-the-mission.jpg" />
        </div>

        <div className="mt-20 border-t-2 border-ink/80 pt-6">
          <h2 className="text-3xl font-medium sm:text-4xl">{about.thanks.title}</h2>
          <p className="mt-2 text-base text-ink-2 sm:text-lg">{about.thanks.text}</p>
        </div>
      </Container>
    </>
  );
}
