"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Competition } from "@/types";
import { getGoogleCalendarLink } from "@/utils/googleCalendar";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Gym {
  id: number;
  name: string;
  url: string;
  location: string;
  google_map_url: string;
}

export default function Home() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "previous">(
    "upcoming"
  );
  const [leagues, setLeagues] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin, loading: userLoading } = useUser();

  async function fetchCompetitions() {
    setDataLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("competitions")
      .select("*, gym:gyms(*), athlete_sheet_url")
      .order("start_date", { ascending: true });

    setDataLoading(false);
    if (error) {
      setError(error.message);
      console.error("Error loading competitions:", error);
    } else {
      const comps = data as Competition[];
      setCompetitions(comps);
      const uniqueLeagues = Array.from(
        new Set(comps.map((c) => c.league))
      ).sort();
      
      const uniqueTypes = Array.from(new Set(comps.map((c) => c.type))).sort();
      setLeagues(uniqueLeagues);
      setTypes(uniqueTypes);
    }
  }

  function formatDateRange(start: string, end: string) {
    // Force local interpretation by appending 'T12:00' (no time zone shift)
    const startDate = new Date(start + "T12:00");
    const endDate = new Date(end + "T12:00");

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const shortOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    const sameDay =
      startDate.getDate() === endDate.getDate() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear();

    if (sameDay) return startDate.toLocaleDateString(undefined, options);

    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();

    if (sameMonth && sameYear) {
      return `${startDate.toLocaleDateString(
        undefined,
        shortOptions
      )}–${endDate.getDate()}, ${endDate.getFullYear()}`;
    } else {
      return `${startDate.toLocaleDateString(
        undefined,
        shortOptions
      )}–${endDate.toLocaleDateString(undefined, options)}`;
    }
  }

  const now = new Date();
  const filteredCompetitions = competitions
    .filter(({ league, type }) => {
      const leagueMatches = filterText === "" || league === filterText;
      const typeMatches = typeFilter === "" || type === typeFilter;
      return leagueMatches && typeMatches;
    })
    .filter((comp) => {
      const endDate = new Date(comp.end_date);
      return activeTab === "upcoming" ? endDate >= now : endDate < now;
    });

  if (userLoading) return null;

  return (
    <main className="p-4 max-w-2xl mx-auto bg-gray-600 min-h-screen text-[#FFF229] font-sans">
      <PageHeader
        title=""
        buttonLabel="Calendar"
        buttonHref="/calendar"
        isAdmin={isAdmin}
      />

      <div className="mb-4 flex justify-center items-center gap-4">
        <Button
          variant={activeTab === "upcoming" ? "secondary" : "default"}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={activeTab === "previous" ? "secondary" : "default"}
          onClick={() => setActiveTab("previous")}
        >
          Previous
        </Button>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <select
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1 p-2 rounded bg-[#303038] text-[#FFF229] focus:outline-none"
        >
          <option value="">All Leagues</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="flex-1 p-2 rounded bg-[#303038] text-[#FFF229] focus:outline-none"
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <Button onClick={() => {
          setFilterText("");
          setTypeFilter("");
        }}>
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        {filteredCompetitions.map((comp) => (
          <Card
  key={comp.id}
  className="relative text-[#303038] overflow-hidden"
  style={{
    backgroundImage: `linear-gradient(rgba(255,242,41,0.9), rgba(255,242,41,0.9)), url(/logos/${comp.league}.png)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <CardContent className="px-3 py-1.5">
    <div className="flex justify-between items-start gap-4 text-sm">
      <div className="w-28 text-left">
        <a
          href={getGoogleCalendarLink(
            comp.gym?.name + " " + comp.league + " " + comp.type,
            comp.start_date,
            comp.end_date,
            `Competition: ${comp.gym?.name} ${comp.league} ${comp.type}`,
            comp.gym?.location || "",
            comp.gym?.google_map_url || ""
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-black"
        >
          {formatDateRange(comp.start_date, comp.end_date)}
        </a>
      </div>

      <div className="flex-1 text-left whitespace-pre-wrap">
        <span className="block">
          {comp.league} | {comp.type}
        </span>
      </div>

      <div className="w-32 text-right font-medium break-words">
        {comp.gym?.location ? (
          <a
            href={comp.gym.google_map_url}
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

    <div className="mt-1 text-xs text-left font-semibold flex items-center gap-1">
      Coach Attending:
      {comp.coach_attending?.toLowerCase() === "yes" ? (
        <span className="text-green-600">☑️</span>
      ) : comp.coach_attending?.toLowerCase() === "no" ? (
        <span className="text-gray-500">⬜</span>
      ) : (
        <span className="text-yellow-500">❓</span>
      )}
    </div>

    <div className="flex justify-center gap-16 mt-3">
      <Button
        variant="default"
        disabled={!comp.registration_url}
        onClick={() =>
          comp.registration_url && window.open(comp.registration_url, "_blank")
        }
      >
        Register
      </Button>
      <Button
        variant="default"
        disabled={!comp.results_url}
        onClick={() =>
          comp.results_url && window.open(comp.results_url, "_blank")
        }
      >
        Results
      </Button>

{comp.athlete_sheet_url && (
<Button
  variant="default"
  onClick={() => router.push(`/athletes/${comp.id}`)}
>
  List
</Button>
)}
    </div>

    {isAdmin && (
      <div className="absolute bottom-2 right-2 z-10">
        <Link href={`/edit/${comp.id}`}>
          <Settings className="w-5 h-5 text-gray-700 hover:text-[#303038] cursor-pointer" />
        </Link>
      </div>
    )}
  </CardContent>
</Card>
        ))}
      </div>
    </main>
  );
}
