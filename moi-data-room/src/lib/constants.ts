export type DocumentCategory =
  | "overview"
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
  matchCategory: DocumentCategory;
  matchTitleHint?: string;
  row: 1 | 2;
  buttonLabel: string;
}

export const HERO_CARDS: readonly HeroCard[] = [
  {
    id: "foundation",
    title: "Foundation",
    tag: "PAPER · RESEARCH",
    tagline: "Formal mathematical framework underpinning the MOI protocol",
    matchCategory: "engineering",
    matchTitleHint: "Yellow",
    row: 1,
    buttonLabel: "Read Paper",
  },
  {
    id: "paradigm",
    title: "Paradigm",
    tag: "PAPER · RESEARCH",
    tagline: "A participant-indexed model redefining computation",
    matchCategory: "contextual_compute",
    row: 1,
    buttonLabel: "Read Paper",
  },
  {
    id: "network",
    title: "Network",
    tag: "PAPER · WHITEPAPER",
    tagline: "The blueprint for decentralized context-aware infrastructure",
    matchCategory: "overview",
    row: 1,
    buttonLabel: "Read Paper",
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck",
    tagline: "Investor presentation",
    matchCategory: "business",
    matchTitleHint: "Slide",
    row: 2,
    buttonLabel: "Open",
  },
  {
    id: "two-pager",
    title: "2 Pager",
    tagline: "Executive summary",
    matchCategory: "overview",
    matchTitleHint: "2 Pager",
    row: 2,
    buttonLabel: "Open",
  },
] as const;

