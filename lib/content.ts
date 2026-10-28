import siteData from "@/content/site.json";
import homeData from "@/content/home.json";
import flagsData from "@/content/flags.json";
import aboutData from "@/content/about.json";
import processData from "@/content/process.json";
import galleryData from "@/content/gallery.json";
import contactData from "@/content/contact.json";
import donateData from "@/content/donate.json";
import registryData from "@/content/registry.json";
import addNameData from "@/content/add-name.json";

export interface Img { src: string; width: number; height: number; alt: string }
export interface Link { label: string; href: string }
export interface ExternalLink { label: string; url: string }

export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  mission: string;
  ein: string;
  email: string;
  phone: { display: string; tel: string };
  social: ExternalLink[];
  nav: Link[];
  actions: Link[];
  footer: { title: string; links: Link[] }[];
}

export interface Flag {
  number: string;
  title?: string;
  description?: string;
  host?: string;
  hostUrl?: string;
  hosts?: { name: string; url: string }[];
  city?: string;
  state?: string;
  stateCode?: string;
  dedicated: string;
  address?: string;
  hostPhone?: string;
  image?: Img;
  memorial?: { name: string; fullName?: string; lifespan: string; bio?: string; image?: Img };
}

export interface Home {
  hero: { eyebrow: string; title: string; image: Img };
  band: Img;
  missionTitle: string;
  /** The mission sentence in three parts: the middle one is set in gray, as on the original. */
  missionParts: string[];
  flagsIntro: { title: string; text: string };
  registryCta: { title: string; text: string; label: string; href: string };
  namesAdded: string;
  sponsorsTitle: string[];
  sponsors: { name: string; src: string; width: number; height: number }[];
}

export interface About {
  eyebrow: string;
  title: string;
  intro: { title: string; text: string };
  history: { title: string; text: string; video: { id: string; title: string } };
  founder: { eyebrow: string; name: string; role: string; paragraphs: string[]; image: Img };
  vision: { eyebrow: string; text: string; cta: string };
  teamIntro: string;
  thanks: { title: string; text: string };
}

export interface ProcessStep {
  label: string;
  title: string;
  paragraphs: string[];
  listTitle?: string;
  list?: string[];
  features?: { title: string; text: string }[];
  image?: Img;
}
export interface FlagSize {
  name: string;
  specs: string[][];
  text: string;
  price: string;
  priceNote: string;
  image: Img;
}
export interface Process {
  title: string;
  steps: ProcessStep[];
  pricing: {
    title: string;
    lede: string;
    text: string;
    sizes: FlagSize[];
    nonprofit: { title: string; text: string; label: string; href: string };
  };
}

export interface MediaItem { title: string; meta: string; kind: string; url: string; image: Img }
export interface Gallery {
  title: string;
  lede: string;
  media: MediaItem[];
  pressOrder: string[];
  videoOrder: string[];
  journey: {
    title: string;
    lede: string;
    text: string;
    events: { title: string; date: string; text: string; links: ExternalLink[]; image: Img }[];
    hostForm: ExternalLink;
  };
  photos: Img[];
}

export interface Contact {
  eyebrow: string;
  title: string;
  lede: string;
  faqTitle: string;
  faqLede: string;
  faq: { q: string; a: string[] }[];
}

export interface Donate {
  title: string;
  text: string;
  checkoutPath: string;
  checkoutLabel: string;
  checkoutNote: string;
}

export interface Registry { title: string; text: string[]; embedUrl: string; openUrl: string }

export interface AddName {
  title: string;
  lede: string;
  process: { title: string; steps: string[]; social: string; profile: string; profileImage: Img };
  notes: { title: string; text: string; warning: string };
  hosts: { title: string; text: string };
  nameTapes: { intro: string; image: Img; guidance: string; examples: string[] };
  donation: { text: string };
}

// `satisfies` makes a misspelled or missing key fail the type check.
export const site: Site = siteData satisfies Site;
export const home: Home = homeData satisfies Home;
export const flags: Flag[] = (flagsData satisfies { flags: Flag[] }).flags;
export const about: About = aboutData satisfies About;
export const processPage: Process = processData satisfies Process;
export const gallery: Gallery = galleryData satisfies Gallery;
export const contact: Contact = contactData satisfies Contact;
export const donate: Donate = donateData satisfies Donate;
export const registry: Registry = registryData satisfies Registry;
export const addName: AddName = addNameData satisfies AddName;

/** The old home page map's state order. */
const STATE_ORDER = ["North Carolina", "Florida", "Georgia", "California", "Colorado", "Virginia", "Ohio"];

/** Flags with a host location, grouped by state in the old map's order (a new state goes last). */
export function flagsByState() {
  const groups = new Map<string, Flag[]>();
  for (const f of flags) {
    if (!f.state) continue;
    groups.set(f.state, [...(groups.get(f.state) ?? []), f]);
  }
  const rank = (s: string) => (STATE_ORDER.includes(s) ? STATE_ORDER.indexOf(s) : STATE_ORDER.length);
  return [...groups.entries()].map(([state, list]) => ({ state, flags: list })).sort((a, b) => rank(a.state) - rank(b.state));
}

/** The Gallery page's Press or Videos row, in the old page's order. A URL with no media item fails the build. */
export function mediaRow(order: string[]) {
  return order.map((url) => {
    const item = gallery.media.find((m) => m.url === url);
    if (!item) throw new Error(`gallery.json: no media item for ${url}`);
    return item;
  });
}

export const flagAnchor = (n: string) => `flag-${n.toLowerCase()}`;

/**
 * WordPress keeps the Gravity Forms entries and the Stripe donation checkout. Today that is
 * flagtoremember.com itself; once the domain points here, WordPress needs its own hostname
 * (WORDPRESS_ORIGIN), or the donate link would point back at this site.
 */
export const wordpressOrigin = () => (process.env.WORDPRESS_ORIGIN || "https://flagtoremember.com").replace(/\/$/, "");
