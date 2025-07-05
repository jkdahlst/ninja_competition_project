"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Gym {
  id: number;
  name: string;
  url: string;
  location: string;
}

interface Competition {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  gym: Gym;
  league: string;
  type: string;
}

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "previous">("upcoming");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  async function fetchCompetitions() {
    const { data, error } = await supabase
      .from("competitions")
      .select("*, gym:gyms(*)")
      .order("start_date", { ascending: true });

    if (error) console.error("Error loading competitions:", error);
    else setCompetitions(data as Competition[]);
  }

  function formatDateRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const shortOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

    if (start === end) return startDate.toLocaleDateString(undefined, options);

    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();

    if (sameMonth && sameYear) {
      return `${startDate.toLocaleDateString(undefined, shortOptions)}–${endDate.getDate()}, ${endDate.getFullYear()}`;
    } else {
      return `${startDate.toLocaleDateString(undefined, shortOptions)}–${endDate.toLocaleDateString(undefined, options)}`;
    }
  }

  function getGoogleCalendarLink(
    name: string,
    startDate: string,
    endDate: string,
    details: string,
    location: string
  ) {
    const start = new Date(startDate).toISOString().replace(/-|:|\.\d+/g, '');
    // Google Calendar event end date is exclusive, so add 1 day if same-day event or use the end date directly
    const end = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d+/g, '');

    const params = new URLSearchParams({
      text: name,
      dates: `${start}/${end}`,
      details,
      location,
    });

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`;
  }

  const now = new Date();
  const filteredCompetitions = competitions
    .filter(({ name, gym, league }) => {
      const search = filterText.toLowerCase();
      return (
        name.toLowerCase().includes(search) ||
        gym?.name.toLowerCase().includes(search) ||
        league.toLowerCase().includes(search)
      );
    })
    .filter((comp) => {
      const endDate = new Date(comp.end_date);
      return activeTab === "upcoming" ? endDate >= now : endDate < now;
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
        <h1 className="text-3xl font-bold text-[#FFD700] whitespace-nowrap">Competitions</h1>
      </div>

      <div className="mb-4 flex justify-center gap-4">
        <Button variant={activeTab === "upcoming" ? "secondary" : "default"} onClick={() => setActiveTab("upcoming")}>Upcoming</Button>
        <Button variant={activeTab === "previous" ? "secondary" : "default"} onClick={() => setActiveTab("previous")}>Previous</Button>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter competitions..."
          className="flex-1 p-2 rounded bg-[#303036] text-[#FFD700] placeholder-[#999] focus:outline-none"
        />
        <Button onClick={() => setFilterText("")}>Clear</Button>
      </div>

      <div className="space-y-4">
        {filteredCompetitions.map((comp) => (
          <Card key={comp.id} className="bg-[#FFD700] text-black">
            <CardContent className="p-2">
              <div className="flex justify-between items-center gap-4 text-sm">
                {/* Left block: Date */}
                <div className="flex-none w-28 text-left">
                  <a
                    href={getGoogleCalendarLink(
                      comp.gym?.name + " " + comp.league + " " + comp.type,
                      comp.start_date,
                      comp.end_date,
                      `Competition: ${comp.gym?.name} ${comp.league} ${comp.type}`,
                      comp.gym?.location || ''
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-black"
                  >
                    {formatDateRange(comp.start_date, comp.end_date)}
                  </a>
                </div>

                {/* Middle-left block: League | Type (wrap allowed) */}
                <div className="flex-1 text-left break-words">
                  {comp.league} | {comp.type}
                </div>

                {/* Middle-right block: Gym name right aligned */}
                <div className="flex-none w-[160px] text-right font-medium break-words">
                  {comp.gym?.url ? (
                    <a
                      href={comp.gym.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black"
                    >
                      {comp.gym.name}
                    </a>
                  ) : (
                    comp.gym?.name
                  )}
                </div>

                {/* Right block: Address clickable */}
                <div className="flex-none w-48 text-right">
                  {comp.gym?.location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comp.gym.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black block"
                    >
                      {comp.gym.location}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
