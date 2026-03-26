export type DocumentCategory =
  | "contextual_compute"
  | "engineering"
  | "business"
  | "tokenomics"
  | "research"
  | "usecases";

export interface DocumentItem {
  title: string;
  desc: string;
  type: string;
  date: string;
  views: number;
}


export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  children?: readonly NavItem[];
}


export const NAV_ITEMS: readonly NavItem[] = [
  { id: "home", label: "Home", icon: "⌂", href: "/home" },
  { id: "contextual_compute", label: "Contextual Compute", icon: "⬡", href: "/contextual-compute" },
  { id: "engineering", label: "Engineering", icon: "⚙", href: "/engineering" },
  { id: "usecases", label: "Use Cases", icon: "◫", href: "/usecases" },
  { id: "tokenomics", label: "Tokenomics", icon: "◉", href: "/tokenomics" },
  { id: "business", label: "Business & GTM", icon: "◧", href: "/business" },
  { id: "research", label: "Research", icon: "◬", href: "/research" },
] as const;

export const STATS = [
  { label: "Accounts", value: "4.3K", icon: "👤", delta: "+12.3%" },
  { label: "Interactions", value: "14.4K", icon: "⚡", delta: "+8.7%" },
  { label: "Consensus Nodes", value: "100", icon: "🔗", delta: "Active" },
  { label: "Community", value: "50K+", icon: "🌐", delta: "+22.1%" },
  { label: "KMOI TVL", value: "$79.0M", icon: "💎", delta: "+5.4%" },
] as const;

/* ------------------------------------------------------------------ */
/*  Home page hero card grid                                           */
/* ------------------------------------------------------------------ */
export interface HeroCard {
  id: string;
  title: string;
  tag?: string;
  tagline: string;
  matchCategory?: DocumentCategory;
  matchTitleHint?: string;
  row: 1 | 2;
  buttonLabel: string;
}

export const HERO_CARDS: readonly HeroCard[] = [
  {
    id: "foundation",
    title: "Foundation",
    tag: "PAPER · MATHEMATICS",
    tagline: "Value ≠ Information",
    matchCategory: "engineering",
    matchTitleHint: "Math",
    row: 1,
    buttonLabel: "Read Paper",
  },
  {
    id: "paradigm",
    title: "Paradigm",
    tag: "PAPER · CONTEXTUAL COMPUTE",
    tagline: "The General Theory of Computation (Value computation)",
    matchCategory: "contextual_compute",
    /** Prefer this doc over other contextual_compute rows (otherwise the newest in category wins). */
    matchTitleHint: "Contextual",
    row: 1,
    buttonLabel: "Read Paper",
  },
  {
    id: "network",
    title: "Network",
    tag: "PAPER · WHITEPAPER",
    tagline: "The Participant Layer: Now YOU have existence within computation",
    matchTitleHint: "Network",
    row: 1,
    buttonLabel: "Read Paper",
  },
  {
    id: "pitch-deck",
    title: "IM deck",
    tagline: "Investor presentation",
    matchCategory: "business",
    matchTitleHint: "Slide",
    row: 2,
    buttonLabel: "Open",
  },
  {
    id: "two-pager",
    title: "CC Intro",
    tagline: "2-pager",
    matchTitleHint: "2 Pager",
    row: 2,
    buttonLabel: "Open",
  },
  {
    id: "gtm-deck",
    title: "GTM Deck",
    tagline: "Go-to-market strategy",
    matchCategory: "business",
    matchTitleHint: "GTM",
    row: 2,
    buttonLabel: "Open",
  },
] as const;

export type HeroCardId = (typeof HERO_CARDS)[number]["id"];

export function isHeroCardId(value: unknown): value is HeroCardId {
  return typeof value === "string" && HERO_CARDS.some((c) => c.id === value);
}

/** Short label for admin (matches home hero tile). */
export function heroHomeAdminLabel(id: HeroCardId): string {
  const c = HERO_CARDS.find((h) => h.id === id);
  return c ? `${c.title} (row ${c.row})` : id;
}

