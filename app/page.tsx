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
  registration_url: string;
  results_url: string;
  coach_attending: "yes" | "no" | "maybe" | null;
}

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [leagues, setLeagues] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "previous">("upcoming");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  async function fetchCompetitions() {
    const { data, error } = await supabase
      .from("competitions")
      .select("*, gym:gyms(*)")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error loading competitions:", error);
    } else {
      const comps = data as Competition[];
      setCompetitions(comps);

      const uniqueLeagues = Array.from(new Set(comps.map((c) => c.league))).sort();
      const uniqueTypes = Array.from(new Set(comps.map((c) => c.type))).sort();
      setLeagues(uniqueLeagues);
      setTypes(uniqueTypes);
    }
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
    .filter((comp) => {
      return (
        (selectedLeague === "" || comp.league === selectedLeague) &&
        (selectedType === "" || comp.type === selectedType)
      );
    })
    .filter((comp) => {
      const endDate = new Date(comp.end_date);
      return activeTab === "upcoming" ? endDate >= now : endDate < now;
    });

  return (
    <main className="p-4 max-w-2xl mx-auto bg-gray-600 min-h-screen text-[#FFE933] font-sans">
      <div className="flex items-center justify-center mb-6 gap-4">
        <Image
          src="https://ninjau.com/wp-content/uploads/2018/09/ninja-u-mobile-logo.png"
          alt="NinjaU Logo"
          width={128}
          height={128}
        />
        <h1 className="text-3xl font-bold text-[#FFE933] whitespace-nowrap">Competitions</h1>
      </div>

      <div className="mb-4 flex justify-center gap-4">
        <Button variant={activeTab === "upcoming" ? "secondary" : "default"} onClick={() => setActiveTab("upcoming")}>Upcoming</Button>
        <Button variant={activeTab === "previous" ? "secondary" : "default"} onClick={() => setActiveTab("previous")}>Previous</Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-2 items-center">
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="flex-1 p-2 rounded bg-[#303036] text-[#FFE933] focus:outline-none"
        >
          <option value="">All Leagues</option>
          {leagues.map((league) => (
            <option key={league} value={league}>{league}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="flex-1 p-2 rounded bg-[#303036] text-[#FFE933] focus:outline-none"
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <Button onClick={() => {
          setSelectedLeague("");
          setSelectedType("");
        }}>Clear</Button>
      </div>

      <div className="space-y-3">
        {filteredCompetitions.map((comp) => (
          <Card key={comp.id} className="bg-[#FFE933] text-black">
            <CardContent className="px-3 py-1.5">
              <div className="flex justify-between items-start gap-4 text-sm">
                <div className="w-28 text-left">
                  <a
                    href={getGoogleCalendarLink(comp.gym?.name + " " + comp.league + " " + comp.type, comp.start_date, comp.end_date, `Competition: ${comp.gym?.name} ${comp.league} ${comp.type}`, comp.gym?.location || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-black"
                  >
                    {formatDateRange(comp.start_date, comp.end_date)}
                  </a>
                </div>

                <div className="flex-1 text-left whitespace-pre-wrap">
                  <span className="block">
                    <Link href={`/league/${comp.league}`} className="underline hover:text-black">
                      {comp.league}
                    </Link>{" "}| {comp.type}
                  </span>
                </div>

                <div className="w-32 text-right font-medium break-words">
                  {comp.gym?.location ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comp.gym.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black"
                    >
                      {comp.gym?.name}
                    </a>
                  ) : (
                    comp.gym?.name
                  )}
                </div>
              </div>

              <div className="mt-1 text-xs text-left font-semibold">
                Coach Attending: {comp.coach_attending ? comp.coach_attending.charAt(0).toUpperCase() + comp.coach_attending.slice(1) : "Unknown"}
              </div>

              <div className="flex justify-center gap-16 mt-3">
                <Button
                  variant="default"
                  disabled={!comp.registration_url}
                  onClick={() => comp.registration_url && window.open(comp.registration_url, "_blank")}
                >
                  Register
                </Button>
                <Button
                  variant="default"
                  disabled={!comp.results_url}
                  onClick={() => comp.results_url && window.open(comp.results_url, "_blank")}
                >
                  Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
