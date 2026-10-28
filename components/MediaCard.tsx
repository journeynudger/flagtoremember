import Image from "next/image";
import type { MediaItem } from "@/lib/content";

// One slide of the original Gallery rows: rounded square picture, title, date or length.
export default function MediaCard({ item }: { item: MediaItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-soft">
        <Image src={item.image.src} alt="" fill sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 80vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <h3 className="mt-4 text-lg font-medium leading-snug text-ink group-hover:underline sm:text-xl">{item.title}</h3>
      <p className="mt-1 text-sm text-muted">{item.meta}</p>
      <span className="sr-only"> ({item.kind}, opens in a new tab)</span>
    </a>
  );
}
