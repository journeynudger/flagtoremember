import type { Metadata } from "next";
import Image from "next/image";
import Carousel from "@/components/Carousel";
import MediaCard from "@/components/MediaCard";
import { Container, Pill } from "@/components/ui";
import { gallery, mediaRow } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Press, videos, events and photos from Flag to Remember.",
};

const row = "basis-[78%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3.75rem)/4)]";

export default function GalleryPage() {
  const j = gallery.journey;
  return (
    <Container className="pb-24 pt-14 sm:pt-20">
      <h1 className="sr-only">Gallery</h1>
      <section aria-labelledby="press">
        <h2 id="press" className="text-5xl font-semibold sm:text-6xl">Press</h2>
        <div className="mt-6">
          <Carousel label="Press" itemClass={row}>
            {mediaRow(gallery.pressOrder).map((m) => (
              <MediaCard key={m.url} item={m} />
            ))}
          </Carousel>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="videos">
        <h2 id="videos" className="text-5xl font-semibold sm:text-6xl">Videos</h2>
        <div className="mt-6">
          <Carousel label="Videos" itemClass={row}>
            {mediaRow(gallery.videoOrder).map((m) => (
              <MediaCard key={m.url} item={m} />
            ))}
          </Carousel>
        </div>
      </section>

      <section className="mt-24 border-t-2 border-ink/80 pt-6" aria-labelledby="journey">
        <div className="grid gap-4 md:grid-cols-2 md:gap-12">
          <h2 id="journey" className="text-4xl font-medium sm:text-5xl">
            Our <span className="accent">Journey</span>
          </h2>
          <p className="text-base leading-relaxed text-ink-2 sm:text-lg">{j.text}</p>
        </div>
        <ul className="mt-12 space-y-14">
          {j.events.map((e, i) => (
            <li key={e.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
              <div className={`relative aspect-[3/2] overflow-hidden rounded-[20px] bg-soft ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={e.image.src} alt={e.image.alt} fill sizes="(min-width: 768px) 500px, 100vw" className="object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-medium sm:text-3xl">{e.title}</h3>
                <p className="accent mt-1 text-lg text-muted">{e.date}</p>
                <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">{e.text}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {e.links.map((l, k) => (
                    <Pill key={l.url} href={l.url} newTab variant={k === 0 ? "outline" : "gray"}>{l.label}</Pill>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24" aria-labelledby="photos">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="photos" className="text-4xl font-medium sm:text-5xl">Photos</h2>
          <Pill href={j.hostForm.url} newTab>{j.hostForm.label}</Pill>
        </div>
        <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {gallery.photos.map((p) => (
            <li key={p.src} className="mb-4 break-inside-avoid">
              <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 100vw" className="h-auto w-full rounded-[20px]" />
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
