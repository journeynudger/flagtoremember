import Link from "next/link";
import { site } from "@/lib/content";
import { newsletterDef } from "@/lib/forms/schema";
import Form from "@/components/forms/Form";

// The original footer: white, a hairline on top, four columns (Flags, About, Connect, Stay Updated),
// then the reCAPTCHA notice, EIN and copyright, centered.
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-[1080px] grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 sm:px-8 md:grid-cols-4 md:py-14">
        {site.footer.map((col) => (
          <div key={col.title}>
            <h2 className="text-lg font-medium text-muted">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("http") ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-ink hover:underline">
                      {l.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={l.href} className="text-lg font-medium text-ink hover:underline">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-lg font-medium text-muted">Stay Updated</h2>
          <div className="mt-3">
            <Form def={newsletterDef} inline />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1080px] space-y-1 px-5 py-5 text-center text-xs leading-relaxed text-muted sm:px-8">
          <p>
            This site is protected by reCAPTCHA and the Google{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-2 hover:underline">Privacy Policy</a> and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-2 hover:underline">Terms of Service</a> apply.
          </p>
          <p>501(c)(3) nonprofit · EIN #{site.ein}</p>
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
