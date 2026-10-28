"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

/**
 * The original's sliders, rebuilt as a native scrolling row: swipe or scroll it, or use the arrows
 * and dots. Nothing moves on its own.
 */
export default function Carousel({
  label,
  children,
  itemClass,
  arrows = "below",
  dots = "gray",
}: {
  label: string;
  children: React.ReactNode;
  /** width of one slide, e.g. "basis-[85%] sm:basis-1/2 lg:basis-1/3" */
  itemClass: string;
  arrows?: "below" | "sides";
  dots?: "gray" | "flag";
}) {
  const track = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [current, setCurrent] = useState(0);

  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const n = Math.max(1, Math.round(t.scrollWidth / t.clientWidth));
    setPages(n);
    setCurrent(Math.min(n - 1, Math.round(t.scrollLeft / t.clientWidth)));
  }, []);

  useEffect(() => {
    measure();
    const t = track.current;
    const ro = new ResizeObserver(measure);
    if (t) ro.observe(t);
    return () => ro.disconnect();
  }, [measure]);

  const go = (page: number) => {
    const t = track.current;
    if (!t) return;
    const next = (page + pages) % pages;
    t.scrollTo({ left: next * t.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      onClick={() => go(current + dir)}
      className={
        arrows === "sides"
          ? "absolute top-[4rem] z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center text-ink " + (dir < 0 ? "-left-10" : "-right-10")
          : "inline-flex size-9 items-center justify-center rounded-md border border-line bg-white text-ink hover:border-ink"
      }
    >
      <span className="sr-only">{dir < 0 ? "Previous" : "Next"}</span>
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {arrows === "sides" ? <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} /> : <path d={dir < 0 ? "M19 12H5m6-6l-6 6 6 6" : "M5 12h14m-6-6l6 6-6 6"} />}
      </svg>
    </button>
  );

  const dotRow = pages > 1 && (
    <div className={`flex flex-wrap items-center ${dots === "flag" ? "justify-center gap-0.5" : "gap-2"}`}>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => go(i)}
          aria-current={i === current ? "true" : undefined}
          className={`inline-flex items-center justify-center ${dots === "flag" ? "size-[22px]" : "size-6"}`}
        >
          <span className="sr-only">Show {label} {i + 1} of {pages}</span>
          <span
            aria-hidden
            className={`block rounded-full transition-colors ${
              dots === "flag" ? `size-2.5 ${i === current ? "bg-navy" : "bg-flag-red"}` : `size-2.5 ${i === current ? "bg-ink" : "bg-[#bdbdbd]"}`
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="relative">
      {arrows === "sides" && pages > 1 && (
        <>
          {arrow(-1)}
          {arrow(1)}
        </>
      )}
      <ul ref={track} onScroll={measure} className="scroll-row relative flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth">
        {Children.map(children, (child) => (
          <li className={`relative shrink-0 snap-start ${itemClass}`}>{child}</li>
        ))}
      </ul>
      {pages > 1 && (
        <div className={`mt-6 flex items-center gap-3 ${arrows === "sides" ? "justify-center" : ""}`}>
          {arrows === "below" && (
            <div className="flex gap-2">
              {arrow(-1)}
              {arrow(1)}
            </div>
          )}
          {dotRow}
        </div>
      )}
    </div>
  );
}
