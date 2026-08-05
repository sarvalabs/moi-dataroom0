/**
 * Calendar events: primary source is GET /api/events (Supabase `calendar_events`).
 * `CALENDAR_EVENTS_FALLBACK` is used only if that request fails (e.g. local dev without DB).
 */

export interface CalendarEvent {
  id: string;
  title: string;
  /** Inclusive start (YYYY-MM-DD) */
  startDate: string;
  /** Inclusive end for multi-day; omit for a single day */
  endDate?: string;
  description?: string;
  href?: string;
  location?: string;
}

/** Row shape returned by `/api/events` (matches `calendar_events`). */
export interface CalendarEventRow {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  href: string | null;
  location: string | null;
}

export function calendarEventFromRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    description: row.description ?? undefined,
    href: row.href ?? undefined,
    location: row.location ?? undefined,
  };
}

/** Offline / misconfigured API fallback only. */
export const CALENDAR_EVENTS_FALLBACK: readonly CalendarEvent[] = [
  {
    id: "sample-eth-denver",
    title: "ETHDenver (booth / meetings)",
    startDate: "2026-02-27",
    endDate: "2026-03-01",
    description: "Team on site for partner and investor conversations.",
    location: "Denver, CO",
  },
  {
    id: "sample-ama",
    title: "Community AMA — network roadmap",
    startDate: "2026-04-22",
    description: "Live Q&A on Discord; recording shared in the data room afterward.",
    href: "https://discord.com",
  },
  {
    id: "sample-token",
    title: "Tokenomics office hours",
    startDate: "2026-05-07",
    description: "Open session for accredited investors; book via Calendly.",
    href: "https://calendly.com/aikrish/meet",
    location: "Video call",
  },
];

export function parseLocalYmd(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

export function localDateFromYmd(s: string): Date {
  const { y, m, d } = parseLocalYmd(s);
  return new Date(y, m - 1, d);
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function eachDayOfEvent(ev: CalendarEvent): string[] {
  const start = localDateFromYmd(ev.startDate);
  const end = ev.endDate ? localDateFromYmd(ev.endDate) : start;
  const out: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(formatYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Events keyed by YYYY-MM-DD for a given calendar month */
export function eventsByDayInMonth(
  events: readonly CalendarEvent[],
  year: number,
  month: number,
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    for (const ymd of eachDayOfEvent(ev)) {
      const { y, m } = parseLocalYmd(ymd);
      if (y !== year || m !== month) continue;
      const list = map.get(ymd) ?? [];
      if (!list.some((e) => e.id === ev.id)) list.push(ev);
      map.set(ymd, list);
    }
  }
  return map;
}

export function compareEventStart(a: CalendarEvent, b: CalendarEvent): number {
  return a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id);
}
