import Link from "next/link";

/** Shared pieces of the original flagtoremember.com look. */

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** "Flag Registry": Inter, with the last words in italic Playfair, over a thin rule. */
export function Title({
  plain,
  accent,
  as: Tag = "h1",
  rule = true,
  className = "",
}: {
  plain: string;
  accent?: string;
  as?: "h1" | "h2";
  rule?: boolean;
  className?: string;
}) {
  return (
    <Tag className={`text-[3.125rem] font-medium leading-[1.05] tracking-[-0.01em] sm:text-6xl lg:text-[4.375rem] ${rule ? "border-b-2 border-ink/80 pb-4 sm:pb-5" : ""} ${className}`}>
      {plain}
      {accent && (
        <>
          {" "}
          <span className="accent">{accent}</span>
        </>
      )}
    </Tag>
  );
}

type PillVariant = "white" | "glass" | "outline" | "gray" | "red";
const pill: Record<PillVariant, string> = {
  white: "border-2 border-white bg-white text-ink hover:bg-white/90",
  glass: "border-2 border-transparent bg-white/25 text-white hover:bg-white/35",
  outline: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
  gray: "border border-transparent bg-field text-ink hover:bg-[#d4d4d4]",
  red: "border border-transparent bg-red text-white hover:bg-red-deep",
};
export const pillClass = (v: PillVariant = "outline", size: "md" | "lg" = "md") =>
  `inline-flex items-center justify-center rounded-full font-medium transition-colors ${size === "lg" ? "px-7 py-2.5 text-lg sm:text-xl" : "px-6 py-2 text-base sm:text-lg"} ${pill[v]}`;

export function Pill({ href, children, variant = "outline", size = "md", newTab }: { href: string; children: React.ReactNode; variant?: PillVariant; size?: "md" | "lg"; newTab?: boolean }) {
  const cls = pillClass(variant, size);
  if (newTab) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  if (href.startsWith("http")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

/** A Divi toggle: rounded light-gray card, "+" title, content revealed below. */
export function Toggle({
  title,
  children,
  open,
  id,
  size = "lg",
  level = 2,
  variant = "card",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  id?: string;
  size?: "lg" | "md";
  /** heading level of the title, so the page outline stays in order */
  level?: 2 | 3;
  /** "bare": a plain "+ title" line with no card, as the original's Flag Registry and FAQ lists. */
  variant?: "card" | "bare";
}) {
  const H = level === 3 ? "h3" : "h2";
  return (
    <details id={id} open={open} className={`toggle scroll-mt-28 ${variant === "card" ? "rounded-[25px] bg-soft" : ""}`}>
      <summary
        className={`flex items-start gap-3 font-medium ${variant === "card" ? "px-5 sm:gap-4 sm:px-7" : "px-2"} ${
          variant === "bare"
            ? size === "lg"
              ? "py-1 text-[1.75rem] sm:py-2 sm:text-[2.1875rem]"
              : "py-2 text-xl sm:text-[1.625rem]"
            : size === "lg"
              ? "py-5 text-[1.5625rem] sm:py-6 sm:text-[2.1875rem]"
              : "py-4 text-xl sm:py-5 sm:text-[1.5625rem]"
        }`}
      >
        {/* The original's thin plus (a minus when open), drawn a little larger than the text. */}
        <svg aria-hidden viewBox="0 0 24 24" className="mt-[0.1em] size-[0.95em] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18" />
          <path className="toggle__v" d="M12 3v18" />
        </svg>
        <H className="min-w-0 font-medium leading-tight">{title}</H>
      </summary>
      <div className={variant === "card" ? "px-5 pb-6 sm:px-7 sm:pb-8 sm:pl-16" : "pb-6 pl-10 pr-2 pt-2"}>{children}</div>
    </details>
  );
}

/** Body copy at a comfortable size (the original used 14px gray). */
export function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-4 text-base leading-relaxed text-ink-2 sm:text-lg ${className}`}>{children}</div>;
}
