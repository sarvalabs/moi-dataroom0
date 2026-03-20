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

/* ------------------------------------------------------------------ */
/*  Subcategories per category                                         */
/* ------------------------------------------------------------------ */
export interface SubCategory {
  id: string;
  label: string;
}

export const SUBCATEGORIES: Partial<Record<DocumentCategory, readonly SubCategory[]>> = {
  contextual_compute: [
    { id: "architecture", label: "Architecture Overview" },
    { id: "coco", label: "CoCo Language" },
    { id: "tesseracts", label: "TESSERACTs" },
    { id: "context_superstate", label: "Context Superstate" },
    { id: "protocol_primitives", label: "Protocol Primitives" },
  ],
  engineering: [
    { id: "yellow_paper", label: "Yellow Paper" },
    { id: "network_objects", label: "Network Objects" },
    { id: "consensus", label: "Consensus (PoXt)" },
    { id: "runtime", label: "Runtime & Execution" },
    { id: "security", label: "Security" },
  ],
  research: [
    { id: "academic_papers", label: "Academic Papers" },
    { id: "quantum_value", label: "Quantum Value Theory" },
    { id: "formal_verification", label: "Formal Verification" },
    { id: "benchmarks", label: "Benchmarks" },
  ],
  business: [
    { id: "gtm_strategy", label: "Go-to-Market Strategy" },
    { id: "partnerships", label: "Partnerships & Ecosystem" },
    { id: "competitive", label: "Competitive Analysis" },
    { id: "revenue", label: "Revenue Model" },
    { id: "traction", label: "Traction & Metrics" },
    { id: "slide_deck", label: "Slide Deck" },
    { id: "team", label: "Team" },
  ],
  tokenomics: [
    { id: "token_model", label: "Token Model" },
    { id: "distribution", label: "Distribution & Vesting" },
    { id: "fee_structure", label: "Fee Structure" },
    { id: "staking", label: "Staking & Rewards" },
  ],
  usecases: [
    { id: "ai_agents", label: "AI Agents" },
    { id: "defi", label: "DeFi" },
    { id: "enterprise", label: "Enterprise" },
    { id: "identity", label: "Identity & Auth" },
  ],
};

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
  { label: "Consensus Nodes", value: "100", icon: "🔗", delta: "Active" },
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

