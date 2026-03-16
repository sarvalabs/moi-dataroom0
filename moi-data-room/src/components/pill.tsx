"use client";

const VARIANTS = {
  default: "bg-accent-dim text-accent",
  green: "bg-[rgba(52,211,153,0.12)] text-[#34D399]",
  amber: "bg-[rgba(251,191,36,0.12)] text-[#FBbf24]",
  red: "bg-[rgba(248,113,113,0.12)] text-[#F87171]",
} as const;

type PillVariant = keyof typeof VARIANTS;

export function Pill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: PillVariant;
}) {
  return (
    <span
      className={`inline-block rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.03em] ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
