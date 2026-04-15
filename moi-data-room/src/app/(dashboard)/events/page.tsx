"use client";

import { EventsCalendar } from "@/components/events-calendar";

export default function EventsPage() {
  return (
    <div className="animate-fade-in-up pb-16">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-text md:text-4xl">
          Events
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-dim">
          Conferences, community sessions, and investor touchpoints. Dates are shown in your local
          timezone for single-day entries.
        </p>
      </div>
      <EventsCalendar />
    </div>
  );
}
