// app/calendar/page.tsx or pages/calendar.tsx
"use client";

import CalendarView from "@/components/CalendarView"; // adjust path if needed
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Competition } from "@/types"; // replace with your actual type if needed
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const { data, error } = await supabase.from("competitions").select("*");

      if (error) {
        console.error("Failed to load competitions:", error);
      } else {
        setCompetitions(data);
      }
    };

    fetchCompetitions();
  }, []);

  return (
    <main className="p-4 max-w-5xl mx-auto bg-gray-600 min-h-screen text-[#FFF229] font-sans">
      <PageHeader
        title="Competitions"
        buttonLabel="Back to List"
        buttonHref="/"
      />

      <CalendarView competitions={competitions} />
    </main>
  );
}
