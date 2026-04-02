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
  { id: "research", label: "Research", icon: "◬", href: "/research" },
  { id: "business", label: "Business & GTM", icon: "◧", href: "/business" },
  { id: "tokenomics", label: "Tokenomics", icon: "◉", href: "/tokenomics" },
  { id: "usecases", label: "Use Cases", icon: "◫", href: "/usecases" },
] as const;

export const STATS = [
  { label: "Accounts", value: "4.3K", icon: "👤", delta: "+12.3%" },
  { label: "Interactions", value: "14.4K", icon: "⚡", delta: "+8.7%" },
  { label: "Consensus Nodes", value: "2,100+", icon: "🔗", delta: "Active" },
  { label: "Community", value: "50K+", icon: "🌐", delta: "+22.1%" },
  { label: "KMOI TVL", value: "$79.0M", icon: "💎", delta: "+5.4%" },
] as const;

/* ------------------------------------------------------------------ */
/*  Fixed document slots — the data room has exactly these 4 docs      */
/* ------------------------------------------------------------------ */
export interface DocSlot {
  slot: DocumentCategory;
  label: string;
  sub: string;
}

export const DOC_SLOTS: readonly DocSlot[] = [
  { slot: "overview", label: "Litepaper", sub: "MOI protocol overview" },
  { slot: "business", label: "Slide Deck", sub: "Investor presentation" },
  { slot: "engineering", label: "Yellow Paper", sub: "Protocol specification" },
  { slot: "contextual_compute", label: "Contextual Compute", sub: "The general theory of computation" },
] as const;

