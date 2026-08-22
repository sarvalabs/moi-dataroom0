"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  CALENDAR_EVENTS_FALLBACK,
  calendarEventFromRow,
  type CalendarEvent,
  type CalendarEventRow,
  eventsByDayInMonth,
  formatYmd,
  localDateFromYmd,
  compareEventStart,
} from "@/lib/events";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthCells(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, month - 1, 1);
  const startPad = first.getDay();
  const lastDay = new Date(year, month, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, -i);
    cells.push({ date: d, inMonth: false });
  }
  for (let day = 1; day <= lastDay; day++) {
    cells.push({ date: new Date(year, month - 1, day), inMonth: true });
  }
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const need = 7 - remainder;
    const d = lastDay + 1;
    for (let i = 0; i < need; i++) {
      cells.push({ date: new Date(year, month - 1, d + i), inMonth: false });
    }
  }
  return cells;
}

function EventDetail({ ev }: { ev: CalendarEvent }) {
  const range =
    ev.endDate && ev.endDate !== ev.startDate
      ? `${ev.startDate} → ${ev.endDate}`
      : ev.startDate;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
        {ev.title}
      </h3>
      <p className="mt-1 text-[12px] text-text-muted">{range}</p>
      {ev.location && (
        <p className="mt-2 text-[13px] text-text-dim">{ev.location}</p>
      )}
      {ev.description && (
        <p className="mt-2 text-[13px] leading-relaxed text-text-dim">{ev.description}</p>
      )}
      {ev.href && (
        <a
          href={ev.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-[13px] font-semibold text-accent hover:text-accent-2"
        >
          Link ↗
        </a>
      )}
    </div>
  );
}

export function EventsCalendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth() + 1,
  }));

  const todayYmd = formatYmd(today);
  const [selectedYmd, setSelectedYmd] = useState<string | null>(todayYmd);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        if (!res.ok) throw new Error("bad");
        const data: CalendarEventRow[] = await res.json();
        if (cancelled) return;
        if (Array.isArray(data)) {
          setEvents(data.map(calendarEventFromRow));
        } else {
          setEvents([...CALENDAR_EVENTS_FALLBACK]);
        }
      } catch {
        if (!cancelled) setEvents([...CALENDAR_EVENTS_FALLBACK]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = useMemo(
    () => eventsByDayInMonth(events, cursor.y, cursor.m),
    [events, cursor.y, cursor.m],
  );

  const cells = useMemo(
    () => buildMonthCells(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );

  const upcoming = useMemo(() => {
    const sorted = [...events].sort(compareEventStart);
    return sorted.filter((ev) => ev.startDate >= todayYmd || (ev.endDate && ev.endDate >= todayYmd));
  }, [events, todayYmd]);

  const go = useCallback((delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m - 1 + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });
  }, []);

  const selectedEvents =
    selectedYmd && byDay.has(selectedYmd) ? (byDay.get(selectedYmd) ?? []) : [];

  return (
    <div className="flex min-w-0 flex-col gap-10 lg:flex-row lg:gap-12">
      <div className="min-w-0 flex-1">
        {eventsLoading && (
          <p className="mb-3 text-[13px] text-text-muted">Loading events…</p>
        )}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-text md:text-2xl">
            {monthLabel(cursor.y, cursor.m)}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-dim transition-colors hover:border-border-bright hover:text-text"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-dim transition-colors hover:border-border-bright hover:text-text"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => {
                const n = new Date();
                setCursor({ y: n.getFullYear(), m: n.getMonth() + 1 });
                setSelectedYmd(formatYmd(n));
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent-dim"
            >
              Today
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface p-2 md:p-3">
          <div className="grid grid-cols-7 gap-px min-w-[280px]">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted"
              >
                {w}
              </div>
            ))}
            {cells.map(({ date, inMonth }, i) => {
              const ymd = formatYmd(date);
              const dayEvents = byDay.get(ymd) ?? [];
              const isToday = ymd === todayYmd;
              const selected = selectedYmd === ymd;

              return (
                <button
                  key={`${ymd}-${i}`}
                  type="button"
                  onClick={() => setSelectedYmd(ymd)}
                  className={[
                    "flex min-h-[72px] flex-col items-stretch rounded-lg p-1.5 text-left transition-colors md:min-h-[88px]",
                    inMonth ? "text-text" : "text-text-muted opacity-50",
                    selected ? "bg-accent-dim ring-1 ring-accent/40" : "hover:bg-surface-2",
                    isToday && inMonth ? "ring-1 ring-border-bright" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mb-1 text-[13px] font-medium",
                      isToday && inMonth ? "text-accent" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </span>
                  <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev.id}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight text-accent md:text-[11px]"
                        style={{ background: "var(--accent-dim)" }}
                        title={ev.title}
                      >
                        {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-text-muted">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-[340px]">
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          {selectedYmd
            ? `Events — ${localDateFromYmd(selectedYmd).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : "Select a day"}
        </h3>
        {selectedYmd && selectedEvents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {selectedEvents.map((ev) => (
              <EventDetail key={ev.id} ev={ev} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-6 text-[13px] text-text-dim">
            No events on this day.
          </p>
        )}

        <h3 className="mb-3 mt-10 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Upcoming
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-[13px] text-text-dim">No upcoming events listed.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => {
                    const t = localDateFromYmd(ev.startDate);
                    setCursor({ y: t.getFullYear(), m: t.getMonth() + 1 });
                    setSelectedYmd(ev.startDate);
                  }}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-bright hover:bg-surface-2"
                >
                  <span className="block text-[12px] text-text-muted">{ev.startDate}</span>
                  <span className="mt-0.5 block text-[13px] font-medium text-text">{ev.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
