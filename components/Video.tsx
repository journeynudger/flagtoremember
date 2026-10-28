"use client";

import Image from "next/image";
import { useState } from "react";

/** A YouTube video that loads only when someone presses play. */
export default function Video({ id, title, poster }: { id: string; title: string; poster: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-night">
      {play ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 size-full">
          <Image src={poster} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-70 transition-opacity group-hover:opacity-85" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-paper/95 shadow-lg transition-transform group-hover:scale-105">
              <svg aria-hidden viewBox="0 0 24 24" className="ml-1 size-8 fill-ink"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
