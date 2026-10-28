import Image from "next/image";
import type { MediaItem } from "@/lib/content";

export default function MediaCard({ item }: { item: MediaItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-night">
        <Image src={item.image.src} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="absolute left-2 top-2 rounded bg-night/80 px-2 py-1 text-[11px] sm:left-3 sm:top-3 sm:text-xs font-semibold uppercase tracking-wider text-paper">{item.kind}</span>
      </div>
      <h3 className="mt-3 font-serif text-lg leading-snug group-hover:underline sm:mt-4 sm:text-xl">{item.title}</h3>
      <p className="mt-1 text-sm text-muted">{item.meta}</p>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
