@AGENTS.md

# Flag to Remember

The flagtoremember.com WordPress (Divi + Gravity Forms) site, rebuilt as a small Next.js site. Nine pages
(`/`, `/flags`, `/about`, `/process`, `/gallery`, `/name-registry`, `/add-name`, `/donate`, `/contact`) plus a 404.
No database and no CMS: every word lives in `content/*.json`, typed in `lib/content.ts`. To change a flag, a
price or the FAQ, edit the JSON and push.

Keys that start with `_` (`_source`, `_note`, `_fixed`) are records only. Nothing renders them.

## Design: the original look, tidied

Matches the live WordPress site as measured on 2026-10-27 (stills and computed styles): white pages, Inter
headings with an italic Playfair Display accent word over a thin rule ("Flag *Registry*"), pill buttons, round logo
and a menu button at every width opening a white panel from the right, the header fixed on every page as a
translucent white bar with a 10px blur, the home page's Flag 005 band with the original's desktop parallax
(`components/ParallaxBand.tsx`; phones and reduced motion get a still photo), counters that count up once, "+" toggles (Process steps, Flag Registry,
FAQ, Our Founder / Our Vision), gray pill fields on Contact and the footer signup, Gravity Forms' red progress bar
and square red Next on Add a Name, the home map (its SVG, `content/us-map.json`) with teal state chips, the orange /
navy / red counters, and the light four-column footer. Colors live in `app/globals.css`.

Changed on purpose: the fixed header turns 80% white once the page scrolls under it (the original stays 25%, hard to
see over text), body text 16–18px instead of 14px, darker grays and reds where the original failed contrast,
real headings inside toggles, sliders that never move on their own (arrows, dots, swipe), the Press and Videos rows
plus the old Our Journey page's events and photos on Gallery.

## Forms: still Gravity Forms, behind a cleaner front

The three forms keep their Gravity Forms backend on WordPress, so entries, notification emails and any feeds
work exactly as before. Nothing about payments is built here.

| Form | Where | Gravity Forms id | Definition |
|------|-------|------------------|------------|
| Add a Name (3 steps, 1 to 5 names, 31 show/hide rules) | `/add-name` | 5 | `content/forms/add-name.json` |
| Contact | `/contact` | 8 | `content/forms/contact.json` |
| Stay Updated (email signup) | footer, every page | 6 | `content/forms/newsletter.json` |

- Field ids, input names and option values were read from the live forms on 2026-10-27 and must not change:
  Gravity Forms stores them as sent. `lib/forms/schema.ts` holds the rules (required, email, 10-digit US phone,
  18-character name tapes, option lists, conditional fields). The browser (`components/forms/Form.tsx`) and the
  server (`app/api/forms/[id]/route.ts`) run the same rules.
- The route posts to `${WORDPRESS_ORIGIN}/wp-json/gf/v2/forms/<id>/submissions`. Gravity Forms then runs its own
  checks and the reCAPTCHA; its "no" comes back on the right field. Spam: honeypot field, a 2-second minimum,
  and 8 posts a minute per address.
- **reCAPTCHA:** every form has an invisible reCAPTCHA (site key `6LfgWxIe…`, in `lib/forms/schema.ts`). Google
  only issues tokens for that key on `flagtoremember.com` (checked 2026-10-27: localhost gets none, a
  vercel.app host gets "Invalid domain for site key"). Forms therefore really submit only on flagtoremember.com
  until the key's owner adds other hosts (preview URLs) in the reCAPTCHA admin.
- **Add a Name, "Would you like to donate now?"** On WordPress, Yes opened a Stripe card field inside the form.
  This site takes no payments, so that question is not shown, `input_79` is always sent as "No" (see `_fixed`),
  and the thank-you message links to the Donate page instead.
- **Donate** links to the existing Stripe checkout: Gravity Forms form 10 at `${WORDPRESS_ORIGIN}/donate/`.
- The existing `/?callback=gravityformsstripe` endpoint is proxied to WordPress before the homepage is
  rendered. This preserves Stripe's configured webhook URL, raw request body and signature header during
  the DNS cutover. WordPress still validates signatures; there is no payment processing in Next.js.

`WORDPRESS_ORIGIN` defaults to `https://flagtoremember.com`. **Before the domain points at this site,
WordPress needs its own hostname** (for example `wp.flagtoremember.com`) set in `WORDPRESS_ORIGIN`. Otherwise
forms would post to this site itself (the route refuses and logs it) and the Donate button would loop.

Testing without creating entries: `FORMS_MODE=validate` sends valid entries to Gravity Forms' validation
endpoint (nothing saved, nothing emailed); `FORMS_MODE=dry` checks locally only. `npm run test:forms` runs 26
checks against a server started with `FORMS_MODE=validate`. Never point it at a server without that flag.

## Where the content came from

| File | Source |
|------|--------|
| `content/site.json` | Header, footer (EIN #88-1652584, Facebook, Instagram), email from the Add Name page. Phone (206) 707-2247 is read from the Flag Host flyer images; it is not text anywhere on the old site. |
| `content/home.json` | Home page (modified 2026-09-28). "1,200+ names added" is on both the home counter and the old Our Journey page. Sponsor list from the home page's logo slider script. |
| `content/flags.json` | Flag Registry page (001–012, flyers, host links, SSG Wade Langley memorial) merged with the home page's state map (002–018). Addresses and host phones are read from each flyer image. Flags 013–018 are only on the map: no flyer, no host link. "Feburary" corrected to February. |
| `content/about.json` | About page and Our Team page (one person, the Founder). |
| `content/process.json` | Process page (modified 2026-10-04). Prices exactly as published: Framed $1,800, Standard $1,700, Venue $2,200, shipping included. |
| `content/gallery.json` | Gallery page (Press and Videos rows, de-duplicated: 7 items) and the old Our Journey page (event write-ups, photos, the Host a Flag Google Form). |
| `content/contact.json` | Contact page FAQ. |
| `content/donate.json`, `content/add-name.json`, `content/registry.json` | Those pages. The registry is the same Airtable shared view, embedded as before. |
| `public/images/*` | WordPress uploads, never enlarged. Raw pull (every page's HTML, REST JSON, all used images, form schemas) is in `~/Downloads/Projects/flagtoremember-raw` (outside the repo). |

Home counters are counted from `flags.json` (19 flags, 7 states) instead of the old fixed 50 and 4; "1,200+ names" is kept as published.

Dropped on purpose: the WordPress "Hello world!" post, its comment form and search box; the Our Team page
(four copies of the same card); the logo carousels (now a static grid). Old URLs `/our-journey`, `/our-team`,
`/hello-world`, `/category/*`, `/author/*`, `/feed`, `/comments/feed`, `/wp-sitemap.xml` 308 to their new home,
and every old `…/` URL reaches its page in one hop (`next.config.ts`).

## Open questions for the client

1. **Where WordPress will live after launch** (its own hostname for `WORDPRESS_ORIGIN`), and who can add the new
   hosts to the reCAPTCHA key. Both are needed before the domain moves.
2. **Flag counts conflict.** The old home counters say 50 flags, 1,200+ names, 4 states; the old Our Journey page
   says 20 active flags, 4 states, 5 cities; the published list has flags 001–018 (19 entries with 009A/009B) in
   7 host states. The new home page shows counts from the list. Which numbers are right?
3. **Phone (206) 707-2247** appears only on the flyers. OK to publish it as the main number?
4. **Flags 013–018:** flyers, host websites and photos to add? 017 and 018 still say "Pending".
5. **Flag 009B's address** is unreadable on its flyer, so it is left out.
6. **"For more than 5 years"** on About: still the wording you want?
7. **Name Registry on phones:** the Airtable embed can't search on phones (as the old page said). A full-screen
   link is added; confirm the shared view `shrtQ3zbDp9T6RDfy` is meant to be public.
8. **Stay Updated** signup has no confirmation text on WordPress; the site says "Thank you for signing up." Fine?

Resolved on 2026-10-27 (Lorenzo: "fix any obvious conflicts"): the FAQ's "$4 per name" now matches the $15 on the
Donate and Add a Name pages; Off-Road Outreach links to offroadoutreach.org (the .com redirects there, as the flyer
says); Flag 002 honors SSG Wade Langley Jr. as both texts say (only the photo's file name said Richard); the founder
is Anthony Peterson (Our Team's "Petersonn" was a typo); Flag 007's address is Starpointe Dr.

## Checks

`npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:forms` (see above). A Playwright sweep (in
the session scratchpad, not the repo) checks overflow, clipping, contrast, headings, alt text, form labels, image
loading, the sticky header and the phone menu at 8 widths.
