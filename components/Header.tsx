"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";

/** Pages whose first section is a full-bleed photo the header sits on, as on the original. */
const OVER_PHOTO = ["/", "/about"];

// The original menu: round logo on the left, a menu button on the right at every width, and a
// white panel that slides in from the right with the pages and a CONTACT button.
const MENU = [
  { label: "Flags", href: "/flags" },
  { label: "About", href: "/about" },
  { label: "Process", href: "/process" },
  { label: "Gallery", href: "/gallery" },
  { label: "Name Registry", href: "/name-registry" },
  { label: "Add Name", href: "/add-name" },
  { label: "Donate", href: "/donate" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const overPhoto = OVER_PHOTO.includes(pathname);
  const [scrolled, setScrolled] = useState(false);

  // The header stays on screen, as on the original. Once the page moves under it, the bar turns
  // more opaque so the logo and menu button stay easy to see over text and photos.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const trigger = button.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>("a,button")];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 backdrop-blur-[10px] transition-colors duration-300 ${scrolled ? "bg-white/80 shadow-[0_1px_0_rgb(0_0_0/0.06)]" : "bg-white/25"}`}
      >
        <div className="flex h-20 items-center justify-between px-4 sm:h-[100px] sm:px-6">
          <Link href="/" aria-label={`${site.name}, home`} className="block">
            <Image src="/images/logo.png" alt="" width={68} height={68} priority className="size-[50px] sm:size-[68px]" />
          </Link>
          <button
            ref={button}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="inline-flex size-12 items-center justify-center rounded-full text-ink-2"
          >
            <span className="sr-only">Menu</span>
            <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>
      {/* Pages without a photo on top start below the bar; photo pages run under it. */}
      {!overPhoto && <div aria-hidden className="h-20 sm:h-[100px]" />}

      {/* Outside the header: its backdrop blur would trap a fixed child inside the bar. */}
      <div className={`fixed inset-0 z-50 overflow-hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!open}
          className={`absolute inset-y-0 right-0 flex w-[min(22rem,86vw)] flex-col overflow-y-auto bg-white px-6 pb-10 pt-5 transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}
        >
          <button type="button" onClick={() => setOpen(false)} className="ml-auto inline-flex size-11 items-center justify-center text-ink">
            <span className="sr-only">Close menu</span>
            <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <nav aria-label="Main" className="mt-8">
            <ul className="border-t border-ink">
              {MENU.map((item) => (
                <li key={item.href} className="border-b border-ink">
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="block py-3 text-xl font-medium text-ink hover:text-red aria-[current=page]:text-red"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            href="/contact"
            className="mt-10 block rounded-md border border-ink py-3 text-center text-base font-medium uppercase tracking-wide text-ink hover:bg-ink hover:text-white"
          >
            Contact
          </Link>
        </div>
      </div>
    </>
  );
}
