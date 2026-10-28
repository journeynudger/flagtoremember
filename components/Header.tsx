"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/content";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 bg-night/95 text-paper backdrop-blur supports-[backdrop-filter]:bg-night/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="mr-auto flex shrink-0 items-center gap-3" aria-label={`${site.name}, home`}>
          <Image src="/images/logo.png" alt="" width={44} height={44} className="size-10 lg:size-11" priority />
          <span className="font-serif text-lg leading-none tracking-tight lg:text-xl">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current(item.href) ? "page" : undefined}
                  className="py-2 text-paper/85 underline-offset-[10px] decoration-gold decoration-2 transition-colors hover:text-paper aria-[current=page]:text-paper aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/donate" className="rounded-md border border-paper/30 px-4 py-2 text-[15px] font-semibold transition-colors hover:border-paper">
            Donate
          </Link>
          <Link href="/add-name" className="rounded-md bg-gold px-4 py-2 text-[15px] font-semibold text-ink transition-colors hover:bg-gold-soft">
            Add a Name
          </Link>
        </div>

        <button
          type="button"
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-md xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Menu"}</span>
          <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <div id="mobile-nav" hidden={!open} className="border-t border-paper/10 xl:hidden">
        <nav aria-label="Main" className="mx-auto max-w-7xl px-4 pb-6 pt-2 sm:px-6 lg:px-8">
          <ul className="divide-y divide-paper/10">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current(item.href) ? "page" : undefined}
                  className="flex items-center justify-between py-3.5 text-lg aria-[current=page]:text-gold-soft"
                >
                  {item.label}
                  <span aria-hidden className="text-paper/70">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
            <Link href="/donate" className="rounded-md border border-paper/30 px-4 py-3 text-center font-semibold">Donate</Link>
            <Link href="/add-name" className="rounded-md bg-gold px-4 py-3 text-center font-semibold text-ink">Add a Name</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
