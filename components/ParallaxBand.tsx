"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The home page's full-width Flag 005 band. On desktop the photo drifts at 70% of the scroll
 * speed, the same parallax the original's Divi section used (layer 30% of a screen taller than
 * the band, shifted by 30% of how far the band has travelled). Phones, tablets and anyone who
 * prefers reduced motion get the still photo.
 */
export default function ParallaxBand({ src, alt }: { src: string; alt: string }) {
  const band = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 981px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const place = () => {
      frame = 0;
      const el = layer.current;
      const box = band.current?.getBoundingClientRect();
      if (!el || !box) return;
      if (!wide.matches) {
        el.style.top = el.style.height = el.style.transform = "";
        return;
      }
      const vh = window.innerHeight;
      if (box.bottom < 0 || box.top > vh) return;
      el.style.top = `${-0.3 * vh}px`;
      el.style.height = `${box.height + 0.3 * vh}px`;
      el.style.transform = `translate3d(0, ${0.3 * (vh - box.top)}px, 0)`;
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    wide.addEventListener("change", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      wide.removeEventListener("change", request);
    };
  }, []);

  return (
    <div ref={band} className="relative h-[clamp(13.75rem,35.3vw,35rem)] overflow-hidden bg-[#3a3f4a]">
      <div ref={layer} className="absolute inset-x-0 top-0 h-full will-change-transform">
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover object-[center_70%] min-[981px]:object-top" />
      </div>
    </div>
  );
}
