import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, Eyebrow, PageHeader } from "@/components/ui";
import Video from "@/components/Video";
import { about } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: about.history.text,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow={about.eyebrow} title={about.title} lede={about.intro.text}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/add-name">Add a Name</Button>
          <Button href="/donate" variant="secondary">Donate</Button>
        </div>
      </PageHeader>

      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>{about.history.title}</Eyebrow>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{about.intro.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{about.history.text}</p>
          </div>
          <Video id={about.history.video.id} title={about.history.video.title} poster="/images/press/join-the-mission.jpg" />
        </Container>
      </section>

      <section className="border-y border-line bg-white py-20 sm:py-28" aria-labelledby="founder">
        <Container className="grid gap-12 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16">
          <figure>
            <Image src={about.founder.image.src} alt={about.founder.image.alt} width={about.founder.image.width} height={about.founder.image.height} sizes="(min-width: 768px) 22rem, 100vw" className="aspect-square w-full rounded-lg object-cover" />
            <figcaption className="mt-3 text-sm text-muted">{about.founder.name}, {about.founder.role}</figcaption>
          </figure>
          <div className="self-center">
            <Eyebrow>{about.founder.eyebrow}</Eyebrow>
            <h2 id="founder" className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{about.founder.name}</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg leading-relaxed">
              {about.founder.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-8 max-w-2xl border-l-2 border-red pl-5 text-muted">{about.teamIntro}</p>
          </div>
        </Container>
      </section>

      <section className="bg-night py-20 text-paper sm:py-28">
        <Container className="max-w-4xl text-center">
          <Eyebrow tone="dark">{about.vision.eyebrow}</Eyebrow>
          <p className="mt-6 font-serif text-3xl leading-snug sm:text-4xl">{about.vision.text}</p>
          <p className="mt-8 text-lg text-paper/80">{about.vision.cta}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/donate" variant="gold">Donate</Button>
            <Button href="/contact" variant="ghost-dark">Sponsor a Flag</Button>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="text-center">
          <h2 className="font-serif text-3xl">{about.thanks.title}</h2>
          <p className="mt-2 text-lg text-muted">{about.thanks.text}</p>
        </Container>
      </section>
    </>
  );
}
