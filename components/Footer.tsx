import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import { newsletterDef } from "@/lib/forms/schema";
import Form from "@/components/forms/Form";

export default function Footer() {
  return (
    <footer className="bg-night text-paper">
      <div className="stripe-rule" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="" width={56} height={56} className="size-14" />
            <p className="font-serif text-2xl leading-tight">{site.name}</p>
          </div>
          <p className="mt-5 max-w-sm leading-relaxed text-paper/75">{site.mission}</p>
        </div>

        {site.footer.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-paper/85 hover:text-paper hover:underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2 lg:col-span-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">Stay Updated</h2>
          <p className="mb-4 mt-4 text-paper/75">Flag dedications and news, by email.</p>
          <Form def={newsletterDef} inline tone="dark" />
          <ul className="mt-8 space-y-2.5">
            <li><a href={`mailto:${site.email}`} className="break-all text-paper/85 hover:text-paper hover:underline">{site.email}</a></li>
            <li><a href={`tel:${site.phone.tel}`} className="text-paper/85 hover:text-paper hover:underline">{site.phone.display}</a></li>
            <li className="flex gap-5 pt-1">
              {site.social.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="text-paper/85 hover:text-paper hover:underline">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-sm text-paper/65 sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span>501(c)(3) nonprofit · EIN #{site.ein}</span>
        </div>
      </div>
    </footer>
  );
}
