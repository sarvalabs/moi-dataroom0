import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants & Data ────────────────────────────────────────────────
const ACCENT = "#7B61FF";
const ACCENT_DIM = "rgba(123,97,255,0.15)";
const ACCENT_GLOW = "rgba(123,97,255,0.25)";
const BG = "#0A0A0A";
const SURFACE = "#141416";
const SURFACE_2 = "#1A1A1E";
const BORDER = "#222228";
const TEXT = "#E8E8ED";
const TEXT_DIM = "#8B8B96";
const TEXT_MUTED = "#5A5A66";

const STATS = [
  { label: "Accounts", value: "4.3K", icon: "👤", delta: "+12.3%" },
  { label: "Interactions", value: "14.4K", icon: "⚡", delta: "+8.7%" },
  { label: "Consensus Nodes", value: "100", icon: "🔗", delta: "Active" },
  { label: "Community", value: "50K+", icon: "🌐", delta: "+22.1%" },
  { label: "KMOI TVL", value: "$79.0M", icon: "💎", delta: "+5.4%" },
];

const DOCUMENTS = {
  overview: [
    { title: "MOI Executive Summary", desc: "High-level overview of MOI's vision, mission, and value proposition for contextual compute.", type: "PDF", date: "2025-12-01", views: 342 },
    { title: "Investor One-Pager", desc: "Condensed pitch document covering market opportunity, traction, and funding details.", type: "PDF", date: "2025-11-28", views: 518 },
    { title: "Company Fact Sheet", desc: "Key facts, milestones, team highlights, and partnership ecosystem at a glance.", type: "PDF", date: "2025-11-15", views: 203 },
    { title: "MOI Pitch Deck — Q4 2025", desc: "Full investor presentation with financial projections, roadmap, and competitive analysis.", type: "PPTX", date: "2025-12-10", views: 891 },
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

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "engineering", label: "Engineering", icon: "⚙" },
  { id: "business", label: "Business & GTM", icon: "◧" },
  { id: "tokenomics", label: "Tokenomics", icon: "◉" },
  { id: "research", label: "Research", icon: "◬" },
  { id: "usecases", label: "Use Cases", icon: "◫" },
  { id: "admin", label: "Admin Dashboard", icon: "⊞" },
];

const ADMIN_DOCS = [
  { id: 1, title: "MOI Executive Summary", category: "Overview", status: "Published", views: 342, uploaded: "2025-12-01" },
  { id: 2, title: "Yellow Paper v2.4", category: "Engineering", status: "Published", views: 156, uploaded: "2025-10-20" },
  { id: 3, title: "Token Economics Paper", category: "Tokenomics", status: "Published", views: 567, uploaded: "2025-09-01" },
  { id: 4, title: "Q1 2026 Update — Draft", category: "Overview", status: "Draft", views: 0, uploaded: "2025-12-12" },
  { id: 5, title: "Series B Term Sheet", category: "Business", status: "Restricted", views: 23, uploaded: "2025-12-08" },
];

// ─── Micro Components ────────────────────────────────────────────────

function Pill({ children, variant = "default" }) {
  const colors = {
    default: { bg: ACCENT_DIM, color: ACCENT },
    green: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
    amber: { bg: "rgba(251,191,36,0.12)", color: "#FBbf24" },
    red: { bg: "rgba(248,113,113,0.12)", color: "#F87171" },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.03em", background: c.bg, color: c.color }}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "sm", onClick, style = {} }) {
  const [hovered, setHovered] = useState(false);
  const base = {
    border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, letterSpacing: "0.01em", transition: "all 0.2s ease",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
  const sizes = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "8px 20px", fontSize: 13 }, lg: { padding: "12px 28px", fontSize: 14 } };
  const variants = {
    primary: { background: hovered ? "#8B71FF" : ACCENT, color: "#fff", boxShadow: hovered ? `0 0 20px ${ACCENT_GLOW}` : "none" },
    ghost: { background: hovered ? ACCENT_DIM : "transparent", color: hovered ? ACCENT : TEXT_DIM, border: `1px solid ${hovered ? ACCENT : "transparent"}` },
    outline: { background: "transparent", color: TEXT_DIM, border: `1px solid ${BORDER}` },
  };
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── BentoCard ───────────────────────────────────────────────────────

function BentoCard({ children, span = 1, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        gridColumn: `span ${span}`, background: SURFACE, borderRadius: 16,
        border: `1px solid ${hov ? "rgba(123,97,255,0.3)" : BORDER}`,
        padding: "24px 28px", transition: "all 0.3s ease", position: "relative", overflow: "hidden",
        boxShadow: hov ? `0 0 30px rgba(123,97,255,0.06), inset 0 0 30px rgba(123,97,255,0.02)` : "none",
        ...style,
      }}>
      {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${ACCENT}40, transparent)` }} />}
      {children}
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────

function StatCard({ stat, index }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100 + index * 80); return () => clearTimeout(t); }, [index]);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: SURFACE, borderRadius: 16, padding: "28px 24px",
        border: `1px solid ${hov ? "rgba(123,97,255,0.35)" : BORDER}`,
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", position: "relative", overflow: "hidden",
        transform: visible ? "translateY(0)" : "translateY(16px)", opacity: visible ? 1 : 0,
        boxShadow: hov ? `0 8px 32px rgba(123,97,255,0.08)` : "none",
      }}>
      {hov && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, rgba(123,97,255,0.06), transparent 70%)`, pointerEvents: "none" }} />}
      <div style={{ fontSize: 24, marginBottom: 12 }}>{stat.icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 4, letterSpacing: "0.01em" }}>{stat.label}</div>
      <div style={{ marginTop: 10 }}>
        <Pill variant="green">{stat.delta}</Pill>
      </div>
    </div>
  );
}

// ─── Document Table ──────────────────────────────────────────────────

function DocTable({ docs, sectionTitle }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 6, letterSpacing: "-0.02em" }}>{sectionTitle}</h2>
      <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 28 }}>
        {docs.length} document{docs.length !== 1 ? "s" : ""} available
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 120px", gap: 12, padding: "10px 20px", borderRadius: 10, background: SURFACE }}>
          {["Document", "Type", "Views", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: i === 3 ? "right" : "left" }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {docs.map((doc, i) => <DocRow key={i} doc={doc} index={i} />)}
      </div>
    </div>
  );
}

function DocRow({ doc, index }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60 + index * 50); return () => clearTimeout(t); }, [index]);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "grid", gridTemplateColumns: "1fr 100px 100px 120px", gap: 12,
        padding: "16px 20px", borderRadius: 10, alignItems: "center",
        background: hov ? SURFACE_2 : "transparent",
        border: `1px solid ${hov ? BORDER : "transparent"}`,
        transition: "all 0.25s ease", cursor: "pointer",
        opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-8px)",
      }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{doc.title}</div>
        <div style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>{doc.desc}</div>
      </div>
      <div><Pill>{doc.type}</Pill></div>
      <div style={{ fontSize: 13, color: TEXT_DIM }}>{doc.views.toLocaleString()}</div>
      <div style={{ textAlign: "right" }}>
        <Button variant={hov ? "primary" : "ghost"} size="sm">
          {doc.type === "LINK" ? "Visit ↗" : "View ↓"}
        </Button>
      </div>
    </div>
  );
}

// ─── Pages ───────────────────────────────────────────────────────────

function HomePage() {
  const [vis, setVis] = useState(false);
  useEffect(() => setVis(true), []);

  return (
    <div>
      {/* Hero */}
      <div style={{
        position: "relative", padding: "64px 0 48px", marginBottom: 48,
        opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(123,97,255,0.06), transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: TEXT_MUTED, textTransform: "uppercase" }}>Confidential — Investor Access Only</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: TEXT, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16, fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
          MOI Data Room
        </h1>
        <p style={{ fontSize: 17, color: TEXT_DIM, maxWidth: 560, lineHeight: 1.7 }}>
          The contextual compute network powering the next generation of decentralized applications.
          Everything you need for due diligence — all in one place.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
          <Button size="lg">Explore Documents</Button>
          <Button variant="ghost" size="lg">Schedule a Call ↗</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Network & Community</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {STATS.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
        </div>
      </div>

      {/* Quick Links Bento */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Quick Access</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {[
            { title: "Pitch Deck", sub: "Q4 2025 investor presentation", emoji: "📊" },
            { title: "Yellow Paper", sub: "Protocol specification v2.4", emoji: "📄" },
            { title: "Tokenomics", sub: "Token model & distribution", emoji: "🪙" },
            { title: "Security Audit", sub: "Halborn audit report", emoji: "🔒" },
          ].map((item, i) => (
            <BentoCard key={i}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{item.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED }}>{item.sub}</div>
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <BentoCard>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Recent Updates</h3>
        {[
          { action: "New document added", detail: "Q1 2026 Roadmap Preview", time: "2 hours ago" },
          { action: "Document updated", detail: "Yellow Paper v2.4 — minor corrections", time: "1 day ago" },
          { action: "New document added", detail: "Series B Term Sheet (Restricted)", time: "3 days ago" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
            <div>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{item.action}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>{item.detail}</div>
            </div>
            <div style={{ fontSize: 11, color: TEXT_MUTED, whiteSpace: "nowrap" }}>{item.time}</div>
          </div>
        ))}
      </BentoCard>
    </div>
  );
}

function SectionPage({ sectionKey, title }) {
  const docs = DOCUMENTS[sectionKey] || [];
  return <DocTable docs={docs} sectionTitle={title} />;
}

// ─── Admin Dashboard ─────────────────────────────────────────────────

function AdminDashboard() {
  const [docs, setDocs] = useState(ADMIN_DOCS);
  const [showModal, setShowModal] = useState(false);

  const statusVariant = (s) => s === "Published" ? "green" : s === "Draft" ? "amber" : "red";

  const analyticsData = [
    { label: "Total Views", value: "3,241", delta: "+18.2%" },
    { label: "Unique Investors", value: "47", delta: "+5" },
    { label: "Avg. Session", value: "12m 34s", delta: "+2m" },
    { label: "Downloads", value: "891", delta: "+11.4%" },
  ];

  const topDocs = [...docs].sort((a, b) => b.views - a.views).slice(0, 5);
  const maxViews = Math.max(...topDocs.map(d => d.views));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Admin Dashboard</h2>
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>Manage documents, permissions, and analytics</p>
        </div>
        <Button size="md" onClick={() => setShowModal(true)}>+ Upload Document</Button>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        {analyticsData.map((a, i) => (
          <BentoCard key={i}>
            <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 8, fontWeight: 500 }}>{a.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em" }}>{a.value}</div>
            <div style={{ marginTop: 8 }}><Pill variant="green">{a.delta}</Pill></div>
          </BentoCard>
        ))}
      </div>

      {/* Chart-like top docs */}
      <BentoCard style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Most Viewed Documents</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {topDocs.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 140, fontSize: 12, color: TEXT_DIM, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
              <div style={{ flex: 1, height: 24, borderRadius: 6, background: SURFACE_2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6, width: `${(d.views / maxViews) * 100}%`,
                  background: `linear-gradient(90deg, ${ACCENT}, #9B81FF)`,
                  transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                  display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{d.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Document Management Table */}
      <BentoCard>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Document Management</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 140px", gap: 12, padding: "10px 16px", borderRadius: 8, background: SURFACE_2 }}>
            {["Document", "Category", "Status", "Views", "Actions"].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {docs.map((d) => (
            <AdminRow key={d.id} doc={d} onDelete={() => setDocs(prev => prev.filter(x => x.id !== d.id))} />
          ))}
        </div>
      </BentoCard>

      {/* Access Controls */}
      <BentoCard style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Access Permissions</h3>
        {[
          { name: "investor@sequoia.com", role: "Investor", access: true },
          { name: "partner@a16z.com", role: "Investor", access: true },
          { name: "analyst@paradigm.xyz", role: "Analyst", access: true },
          { name: "pending@polychain.com", role: "Pending", access: false },
        ].map((user, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
            <div>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{user.role}</div>
            </div>
            <ToggleSwitch checked={user.access} />
          </div>
        ))}
      </BentoCard>

      {/* Upload Modal */}
      {showModal && <UploadModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function AdminRow({ doc, onDelete }) {
  const [hov, setHov] = useState(false);
  const statusVariant = (s) => s === "Published" ? "green" : s === "Draft" ? "amber" : "red";
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 140px", gap: 12, padding: "14px 16px", borderRadius: 8, alignItems: "center", background: hov ? SURFACE_2 : "transparent", transition: "all 0.2s ease" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{doc.title}</div>
      <div style={{ fontSize: 12, color: TEXT_DIM }}>{doc.category}</div>
      <div><Pill variant={statusVariant(doc.status)}>{doc.status}</Pill></div>
      <div style={{ fontSize: 12, color: TEXT_DIM }}>{doc.views}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <Button variant="ghost" size="sm">Edit</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} style={{ color: "#F87171" }}>Delete</Button>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked: initial }) {
  const [on, setOn] = useState(initial);
  return (
    <div onClick={() => setOn(!on)} style={{
      width: 40, height: 22, borderRadius: 11, padding: 2, cursor: "pointer",
      background: on ? ACCENT : SURFACE_2, border: `1px solid ${on ? ACCENT : BORDER}`,
      transition: "all 0.2s ease", display: "flex", alignItems: on ? "center" : "center",
      justifyContent: on ? "flex-end" : "flex-start",
    }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: on ? "#fff" : TEXT_MUTED, transition: "all 0.2s ease" }} />
    </div>
  );
}

function UploadModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, width: 440, maxWidth: "90vw" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Upload Document</h3>
        <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 24 }}>Add a new document to the investor data room.</p>
        {[
          { label: "Title", placeholder: "e.g. Q1 2026 Financial Projections" },
          { label: "Category", placeholder: "Select category..." },
          { label: "Description", placeholder: "Brief description of the document" },
        ].map((field, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_DIM, display: "block", marginBottom: 6 }}>{field.label}</label>
            <input placeholder={field.placeholder} style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`,
              background: SURFACE_2, color: TEXT, fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif",
              boxSizing: "border-box",
            }} />
          </div>
        ))}
        <div style={{ border: `2px dashed ${BORDER}`, borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 24, cursor: "pointer" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 13, color: TEXT_DIM }}>Drop file here or click to browse</div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>PDF, PPTX, DOCX — Max 50MB</div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Upload</Button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Chatbot ──────────────────────────────────────────────────────

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to the MOI Data Room assistant. Ask me anything about MOI's technology, tokenomics, roadmap, or any document in the data room." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful AI assistant embedded in the MOI Protocol investor data room. MOI is a contextual compute network — a blockchain protocol with a novel execution architecture built around interactions (not transactions), TESSERACTs (stateful containers), and the CoCo/Cocolang programming language. 

Key facts: 4.3K accounts, 14.4K interactions, 100 active consensus nodes, 50K+ community members, $79M KMOI TVL. 

Answer questions about MOI's technology, tokenomics, go-to-market strategy, team, and investment thesis. Be concise, professional, and helpful. If you don't know something specific, say so and suggest which document in the data room might have the answer.`,
          messages: [...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })), { role: "user", content: userMsg }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "I apologize, I couldn't process that request. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
    setLoading(false);
  }, [input, loading, messages]);

  return (
    <>
      {/* FAB */}
      <div onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: 24, right: 24, width: 52, height: 52, borderRadius: 16,
        background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: `0 4px 24px ${ACCENT_GLOW}`, zIndex: 999,
        transition: "all 0.3s ease", transform: open ? "rotate(45deg)" : "none",
      }}>
        <span style={{ fontSize: 22, color: "#fff", lineHeight: 1 }}>{open ? "+" : "✦"}</span>
      </div>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, width: 380, maxWidth: "calc(100vw - 48px)",
          height: 520, maxHeight: "calc(100vh - 120px)", borderRadius: 16, overflow: "hidden",
          background: SURFACE, border: `1px solid ${BORDER}`, zIndex: 999,
          display: "flex", flexDirection: "column",
          boxShadow: "0 16px 64px rgba(0,0,0,0.5), 0 0 40px rgba(123,97,255,0.08)",
          animation: "fadeSlideUp 0.25s ease",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#34D399" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>MOI Data Room AI</div>
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%", padding: "10px 14px", borderRadius: 12,
                background: msg.role === "user" ? ACCENT : SURFACE_2,
                color: msg.role === "user" ? "#fff" : TEXT,
                fontSize: 13, lineHeight: 1.6,
                borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                borderBottomLeftRadius: msg.role === "user" ? 12 : 4,
              }}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: 12, background: SURFACE_2, fontSize: 13, color: TEXT_DIM }}>
                <span style={{ display: "inline-flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: 3, background: TEXT_MUTED,
                      animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, flexShrink: 0 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about MOI..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                background: SURFACE_2, color: TEXT, fontSize: 13, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }} />
            <button onClick={send} style={{
              width: 38, height: 38, borderRadius: 10, border: "none", background: ACCENT,
              color: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────

function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{
      width: collapsed ? 60 : 230, height: "100vh", position: "fixed", left: 0, top: 0,
      background: SURFACE, borderRight: `1px solid ${BORDER}`, padding: "20px 0",
      display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
      zIndex: 100, overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "0 12px 20px" : "0 20px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => setCollapsed(!collapsed)}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, #9B81FF)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14, flexShrink: 0 }}>
          M
        </div>
        {!collapsed && <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>MOI Protocol</span>}
      </div>

      <div style={{ height: 1, background: BORDER, margin: collapsed ? "0 8px 12px" : "0 16px 12px" }} />

      {/* Nav Items */}
      <div style={{ flex: 1, padding: collapsed ? "0 8px" : "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <SidebarItem key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} collapsed={collapsed} />
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT_DIM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: ACCENT }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Admin</div>
              <div style={{ fontSize: 10, color: TEXT_MUTED }}>admin@moi.technology</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ item, active, onClick, collapsed }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: collapsed ? "10px 12px" : "9px 14px", borderRadius: 10, cursor: "pointer",
        background: active ? ACCENT_DIM : hov ? `rgba(255,255,255,0.03)` : "transparent",
        color: active ? ACCENT : hov ? TEXT : TEXT_DIM,
        transition: "all 0.15s ease", position: "relative",
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
      {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 2, background: ACCENT }} />}
      <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: "center" }}>{item.icon}</span>
      {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{item.label}</span>}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────

export default function InvestorDataRoom() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "overview": return <SectionPage sectionKey="overview" title="Overview" />;
      case "engineering": return <SectionPage sectionKey="engineering" title="Engineering" />;
      case "business": return <SectionPage sectionKey="business" title="Business & GTM" />;
      case "tokenomics": return <SectionPage sectionKey="tokenomics" title="Tokenomics" />;
      case "research": return <SectionPage sectionKey="research" title="Research" />;
      case "usecases": return <SectionPage sectionKey="usecases" title="Use Cases" />;
      case "admin": return <AdminDashboard />;
      default: return <HomePage />;
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: TEXT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${TEXT_MUTED}; }
        input::placeholder { color: ${TEXT_MUTED}; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Sidebar active={page} onNavigate={setPage} />

      <div style={{ marginLeft: 230, minHeight: "100vh", padding: "40px 56px 80px", maxWidth: 960, transition: "margin-left 0.3s ease" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ cursor: "pointer" }} onClick={() => setPage("home")}>Data Room</span>
          {page !== "home" && <>
            <span style={{ color: BORDER }}>›</span>
            <span style={{ color: TEXT_DIM }}>{NAV_ITEMS.find(n => n.id === page)?.label}</span>
          </>}
        </div>

        {renderPage()}
      </div>

      <ChatBot />
    </div>
  );
}
