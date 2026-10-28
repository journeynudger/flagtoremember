import Link from "next/link";

/** Shared building blocks so every page keeps the same rhythm. */

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${tone === "dark" ? "text-gold-soft" : "text-red"}`}>{children}</p>
  );
}

export function PageHeader({ eyebrow, title, lede, children }: { eyebrow?: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line bg-paper-deep/60">
      <Container className="py-14 sm:py-20">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
        {lede && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{lede}</p>}
        {children}
      </Container>
    </section>
  );
}

type BtnProps = { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "gold" | "ghost-dark"; external?: boolean };
const btn = {
  primary: "bg-navy text-paper hover:bg-navy-deep",
  secondary: "border border-ink/20 bg-white text-ink hover:border-navy",
  gold: "bg-gold text-ink hover:bg-gold-soft",
  "ghost-dark": "border border-paper/40 text-paper hover:border-paper",
};
export function Button({ href, children, variant = "primary", external }: BtnProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors ${btn[variant]}`;
  if (external || href.startsWith("http")) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return <Link href={href} className={cls}>{children}</Link>;
}
