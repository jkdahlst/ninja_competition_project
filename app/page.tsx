"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Competition type
interface Competition {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  league: string;
  type: string;
}

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  async function fetchCompetitions() {
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) console.error("Error loading competitions:", error);
    else {
      console.log("Competitions fetched:", data);
      setCompetitions(data as Competition[]);
    }
  }

  function formatDateRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const shortOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

    if (start === end) {
      return startDate.toLocaleDateString(undefined, options);
    }

    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();

    if (sameMonth && sameYear) {
      return `${startDate.toLocaleDateString(undefined, shortOptions)}–${endDate.getDate()}, ${endDate.getFullYear()}`;
    } else {
      return `${startDate.toLocaleDateString(undefined, shortOptions)}–${endDate.toLocaleDateString(undefined, options)}`;
    }
  }

  const filteredCompetitions = competitions.filter(({ name, location, league }) => {
    const search = filterText.toLowerCase();
    return (
      name.toLowerCase().includes(search) ||
      location.toLowerCase().includes(search) ||
      league.toLowerCase().includes(search)
    );
  });

  return (
    <main className="p-4 max-w-2xl mx-auto bg-black min-h-screen text-[#FFD700] font-sans">
      <div className="flex items-center justify-center mb-6 gap-4">
        <Image
          src="https://ninjau.com/wp-content/uploads/2018/09/ninja-u-mobile-logo.png"
          alt="NinjaU Logo"
          width={128}
          height={128}
        />
        <h1 className="text-2xl font-bold text-[#FFD700] whitespace-nowrap">Upcoming Competitions</h1>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter competitions..."
          className="w-full p-2 rounded bg-[#303036] text-[#FFD700] placeholder-[#999] focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {filteredCompetitions.map((comp) => (
          <Card key={comp.id} className="bg-[#FFD700] text-black">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">{comp.name}</h2>
              <p>{formatDateRange(comp.start_date, comp.end_date)} - {comp.location}</p>
              <p className="text-sm">League: {comp.league} | Type: {comp.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
