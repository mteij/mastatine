"use client";

import { useClientValue } from "@/lib/use-client-value";

function timeOfDayGreeting(hour: number): string {
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardGreeting() {
  const greeting = useClientValue(() => timeOfDayGreeting(new Date().getHours()), "Good afternoon");

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-black text-white">
        {greeting}, mastende engineer.
      </h1>
      <p className="text-white/90 text-lg mt-1">Have a great day!</p>
    </>
  );
}
