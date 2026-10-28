import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, Eyebrow, PageHeader } from "@/components/ui";
import MediaCard from "@/components/MediaCard";
import { gallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Press, videos, events and photos from Flag to Remember.",
};

export default function GalleryPage() {
  const j = gallery.journey;
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Press, videos and the road so far" lede={j.lede} />

      <section className="py-16 sm:py-24" aria-labelledby="media">
        <Container>
          <h2 id="media" className="font-serif text-3xl tracking-tight sm:text-4xl">Press & Videos</h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
            {gallery.media.map((m) => (
              <li key={m.url}><MediaCard item={m} /></li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-24" aria-labelledby="journey">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow>Events</Eyebrow>
            <h2 id="journey" className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{j.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{j.text}</p>
          </div>
          <ul className="mt-14 space-y-14">
            {j.events.map((e, i) => (
              <li key={e.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                <div className={`relative aspect-[3/2] overflow-hidden rounded-lg bg-night ${i % 2 ? "md:order-2" : ""}`}>
                  <Image src={e.image.src} alt={e.image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-red">{e.date}</p>
                  <h3 className="mt-2 font-serif text-3xl">{e.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{e.text}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {e.links.map((l, k) => (
                      <Button key={l.url} href={l.url} variant={k === 0 ? "primary" : "secondary"}>{l.label}</Button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="photos">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="photos" className="font-serif text-3xl tracking-tight sm:text-4xl">Photos</h2>
            <Button href={j.hostForm.url} variant="secondary">{j.hostForm.label}</Button>
          </div>
          <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {gallery.photos.map((p) => (
              <li key={p.src} className="mb-4 break-inside-avoid">
                <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="h-auto w-full rounded-lg" />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
