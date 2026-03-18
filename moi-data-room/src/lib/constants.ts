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

export interface AdminDoc {
  id: number;
  title: string;
  category: string;
  status: string;
  views: number;
  uploaded: string;
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
  { label: "Consensus Nodes", value: "100", icon: "🔗", delta: "Active" },
  { label: "Community", value: "50K+", icon: "🌐", delta: "+22.1%" },
  { label: "KMOI TVL", value: "$79.0M", icon: "💎", delta: "+5.4%" },
] as const;

export const DOCUMENTS: Record<string, DocumentItem[]> = {
  overview: [
    { title: "MOI Executive Summary", desc: "High-level overview of MOI's vision, mission, and value proposition for contextual compute.", type: "PDF", date: "2025-12-01", views: 342 },
    { title: "Investor One-Pager", desc: "Condensed pitch document covering market opportunity, traction, and funding details.", type: "PDF", date: "2025-11-28", views: 518 },
    { title: "Company Fact Sheet", desc: "Key facts, milestones, team highlights, and partnership ecosystem at a glance.", type: "PDF", date: "2025-11-15", views: 203 },
    { title: "MOI Pitch Deck — Q4 2025", desc: "Full investor presentation with financial projections, roadmap, and competitive analysis.", type: "PPTX", date: "2025-12-10", views: 891 },
  ],
  contextual_compute: [
    { title: "Contextual Compute Whitepaper", desc: "Foundational paper defining contextual compute, interaction-based execution, and MOI's novel approach to decentralized computing.", type: "PDF", date: "2025-11-01", views: 312 },
    { title: "TESSERACT Architecture Overview", desc: "Deep dive into TESSERACTs — stateful containers that enable context-aware execution on MOI.", type: "PDF", date: "2025-10-15", views: 198 },
    { title: "Interaction Model Specification", desc: "Formal specification of MOI's interaction-first paradigm vs traditional transaction-based blockchains.", type: "PDF", date: "2025-09-20", views: 145 },
  ],
  engineering: [
    { title: "Yellow Paper — MOI Protocol v2.4", desc: "Formal specification of MOI's execution architecture, consensus mechanism, and state management.", type: "PDF", date: "2025-10-20", views: 156 },
    { title: "CoCo Language Specification", desc: "Complete language reference for Cocolang — MOI's smart contract programming language.", type: "PDF", date: "2025-09-15", views: 98 },
    { title: "Architecture Deep Dive", desc: "Technical breakdown of MOI's contextual compute engine, TESSERACTs, and interaction model.", type: "PDF", date: "2025-11-05", views: 234 },
    { title: "Security Audit Report — Halborn", desc: "Independent security audit covering protocol-level and smart contract vulnerabilities.", type: "PDF", date: "2025-08-30", views: 167 },
    { title: "Developer Documentation Portal", desc: "Link to the live developer docs site covering SDK, APIs, and CoCo tutorials.", type: "LINK", date: "2025-12-01", views: 445 },
  ],
  business: [
    { title: "Go-to-Market Strategy", desc: "Detailed GTM plan covering developer acquisition, enterprise partnerships, and ecosystem growth.", type: "PDF", date: "2025-11-20", views: 289 },
    { title: "Market Sizing & TAM Analysis", desc: "Bottom-up market sizing for contextual compute within the $150B+ cloud infrastructure market.", type: "PDF", date: "2025-10-10", views: 176 },
    { title: "Competitive Landscape", desc: "Comparative analysis against EVM chains, alternative L1s, and off-chain compute providers.", type: "PDF", date: "2025-11-01", views: 312 },
    { title: "Partnership Pipeline", desc: "Overview of confirmed and in-progress integrations with DeFi protocols, enterprises, and infra providers.", type: "PDF", date: "2025-12-05", views: 198 },
  ],
  tokenomics: [
    { title: "MOI Token Economics Paper", desc: "Complete tokenomics model covering supply schedule, utility, staking, and governance mechanics.", type: "PDF", date: "2025-09-01", views: 567 },
    { title: "Token Distribution Schedule", desc: "Vesting timelines, unlock curves, and allocation breakdown across all stakeholder categories.", type: "PDF", date: "2025-09-01", views: 423 },
    { title: "Staking & Validator Economics", desc: "Economic model for node operators including reward rates, slashing conditions, and delegation.", type: "PDF", date: "2025-10-15", views: 234 },
  ],
  research: [
    { title: "Contextual Compute Thesis", desc: "Research paper on why context-aware execution is the next paradigm shift in decentralized computing.", type: "PDF", date: "2025-07-20", views: 89 },
    { title: "State Scalability Benchmarks", desc: "Performance benchmarks comparing MOI's state management against EVM and Move-based chains.", type: "PDF", date: "2025-08-15", views: 145 },
    { title: "Interaction-Based Execution Model", desc: "Academic paper formalizing MOI's interaction-first approach vs. transaction-based models.", type: "PDF", date: "2025-06-10", views: 78 },
  ],
  usecases: [
    { title: "DeFi on MOI — Case Studies", desc: "How contextual compute enables novel DeFi primitives: context-aware AMMs, adaptive lending, and more.", type: "PDF", date: "2025-11-10", views: 267 },
    { title: "Enterprise Integration Playbook", desc: "Reference architecture for enterprises integrating MOI's compute layer into existing infrastructure.", type: "PDF", date: "2025-10-25", views: 134 },
    { title: "Gaming & Metaverse Applications", desc: "Use cases for on-chain game state, player identity, and interoperable digital assets on MOI.", type: "PDF", date: "2025-09-20", views: 112 },
    { title: "Supply Chain & IoT", desc: "Contextual compute applications for real-time supply chain verification and IoT data integrity.", type: "PDF", date: "2025-08-05", views: 91 },
  ],
};

export const ADMIN_DOCS: AdminDoc[] = [
  { id: 1, title: "MOI Executive Summary", category: "Overview", status: "Published", views: 342, uploaded: "2025-12-01" },
  { id: 2, title: "Yellow Paper v2.4", category: "Engineering", status: "Published", views: 156, uploaded: "2025-10-20" },
  { id: 3, title: "Token Economics Paper", category: "Tokenomics", status: "Published", views: 567, uploaded: "2025-09-01" },
  { id: 4, title: "Q1 2026 Update — Draft", category: "Overview", status: "Draft", views: 0, uploaded: "2025-12-12" },
  { id: 5, title: "Series B Term Sheet", category: "Business", status: "Restricted", views: 23, uploaded: "2025-12-08" },
];

export const QUICK_ACCESS = [
  { title: "Pitch Deck", sub: "Q4 2025 investor presentation", emoji: "📊" },
  { title: "Yellow Paper", sub: "Protocol specification v2.4", emoji: "📄" },
  { title: "Tokenomics", sub: "Token model & distribution", emoji: "🪙" },
  { title: "Lite Paper", sub: "MOI protocol overview", emoji: "📝" },
] as const;

export const RECENT_ACTIVITY = [
  { action: "New document added", detail: "Q1 2026 Roadmap Preview", time: "2 hours ago" },
  { action: "Document updated", detail: "Yellow Paper v2.4 — minor corrections", time: "1 day ago" },
  { action: "New document added", detail: "Series B Term Sheet (Restricted)", time: "3 days ago" },
] as const;

export const ANALYTICS_DATA = [
  { label: "Total Views", value: "3,241", delta: "+18.2%" },
  { label: "Unique Investors", value: "47", delta: "+5" },
  { label: "Avg. Session", value: "12m 34s", delta: "+2m" },
  { label: "Downloads", value: "891", delta: "+11.4%" },
] as const;

export const ACCESS_USERS = [
  { name: "investor@sequoia.com", role: "Investor", access: true },
  { name: "partner@a16z.com", role: "Investor", access: true },
  { name: "analyst@paradigm.xyz", role: "Analyst", access: true },
  { name: "pending@polychain.com", role: "Pending", access: false },
] as const;
