"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A home counter that counts up from 0 the first time it scrolls into view, as the original's
 * number counters did. The final value is in the HTML from the start (and stays put for anyone
 * who prefers reduced motion), so nothing depends on the script running.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const el = useRef<HTMLElement>(null);
  const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : NaN;
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = el.current;
    if (!node || !match || !Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, before, , after] = match;
    const format = (n: number) => `${before}${n.toLocaleString("en-US")}${after}`;
    // Only count when the counter starts below the fold; one already on screen stays still.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          setShown(format(Math.round(target * (1 - (1 - t) ** 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setShown(format(0));
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <dd ref={el} className={className}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{value}</span>
    </dd>
  );
}
