"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Athlete {
  Name: string;
  Division: string;
}

function parseCSVWithTimestamp(text: string): {
  athletes: Athlete[];
  lastUpdated: string | null;
} {
  const rawLines = text.trim().split("\n").map(line => line.trim());
  let lines = rawLines.filter(line => line && !/^,+$/.test(line)); // Remove empty or comma-only lines

  let lastUpdated: string | null = null;

  if (/^last updated:/i.test(lines[0])) {
    lastUpdated = lines[0].replace(/^last updated:\s*/i, "").replace(/,+$/, "").trim();
    lines = lines.slice(1);
  }

  if (lines.length === 0) return { athletes: [], lastUpdated };

  const headers = lines[0].split(",").map(h => h.trim());

  const athletes = lines.slice(1).map((line) => {
    const values =
      line
        .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        ?.map((v) => v.replace(/^"|"$/g, "").trim()) || [];
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj as Athlete;
  });

  return { athletes, lastUpdated };
}

function extractDivision(fullDivision: string | undefined): { name: string; isEmployee: boolean } {
  if (!fullDivision) return { name: "Unknown", isEmployee: false };

  const trimmed = fullDivision.trim();
  const isEmployee = /employee/i.test(trimmed);
  const cleaned = trimmed.replace(/employee/i, "").trim().replace(/\s{2,}/g, " ");

  const genderMatch = cleaned.match(/\b(male|female)\b/i);
  const gender = genderMatch ? genderMatch[0][0].toUpperCase() + genderMatch[0].slice(1).toLowerCase() : "Unknown";

  if (/\bpro\b/i.test(cleaned)) {
    return { name: `${gender} Pro`, isEmployee };
  }

  const ageRangeMatch = cleaned.match(/\b\d{1,2}-\d{1,2}\b/);
  const agePlusMatch = cleaned.match(/\b\d+\+\b/);
  const ageUmatch = cleaned.match(/\b\d+U\b/i);
  const ageNumberMatch = cleaned.match(/\b\d+\b/);

  const ageGroup =
    ageRangeMatch?.[0] ??
    agePlusMatch?.[0] ??
    ageUmatch?.[0] ??
    ageNumberMatch?.[0] ??
    "Unknown";

  return { name: `${gender} ${ageGroup}`, isEmployee };
}

function divisionSortKey(div: string): number {
  const divLower = div.toLowerCase();

  if (divLower.includes("pro")) return 9999;

  const female = divLower.includes("female");
  const male = divLower.includes("male");

  const matches = div.match(/(\d+)\+?/g);
  if (matches && matches.length > 0) {
    let numStr = matches[matches.length - 1];
    numStr = numStr.replace("+", "");
    const base = parseInt(numStr, 10);
    return female ? base - 0.1 : base;
  }

  return female ? 9998 : 9997;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClientAthletesPage({ competitionId }: { competitionId: string }) {
  const [groupedAthletes, setGroupedAthletes] = useState<
    Record<string, { name: string; isEmployee: boolean; originalDivision: string }[]>
  >({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyNinjaU, setShowOnlyNinjaU] = useState(false);

  useEffect(() => {
    async function fetchAthleteSheet() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("competitions")
          .select("athlete_sheet_url")
          .eq("id", competitionId)
          .single();

        if (error) throw error;
        if (!data?.athlete_sheet_url) {
          throw new Error("No athlete sheet URL found for this competition");
        }

        const res = await fetch(data.athlete_sheet_url);
        if (!res.ok) throw new Error("Failed to fetch athlete sheet data");

        const csv = await res.text();
        const { athletes, lastUpdated } = parseCSVWithTimestamp(csv);
        setLastUpdated(lastUpdated);

        const grouped = athletes.reduce((acc: Record<string, { name: string; isEmployee: boolean; originalDivision: string }[]>, athlete) => {
          const { name: divName, isEmployee } = extractDivision(athlete.Division);
          if (!acc[divName]) acc[divName] = [];
          acc[divName].push({ name: athlete.Name, isEmployee, originalDivision: athlete.Division || "" });
          return acc;
        }, {});

        setGroupedAthletes(grouped);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchAthleteSheet();
  }, [competitionId]);

  if (loading) return <p>Loading athletes...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <main className="p-4 max-w-2xl mx-auto font-sans text-[#303038]">
      <h1 className="text-2xl font-bold mb-6">
        
        Athletes by Division ({Object.values(groupedAthletes).reduce((sum, list) => sum + list.length, 0)})
        {lastUpdated && (
          <p className="text-sm text-gray-600 mb-4">Last updated: {lastUpdated}</p>
        )}
      </h1>

      <div className="mb-4">
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            onClick={() => setShowOnlyNinjaU(prev => !prev)}
        >
            {showOnlyNinjaU ? "Show All Athletes" : "Show Only NinjaU Athletes"}
        </button>
      </div>
      {Object.entries(groupedAthletes).length === 0 && <p>No athletes found.</p>}

      {Object.entries(groupedAthletes)
        .sort(([a], [b]) => divisionSortKey(a) - divisionSortKey(b))
        .map(([division, names]) => {
        const filteredNames = showOnlyNinjaU
        ? names.filter(({ originalDivision }) =>
            /ninja\s*u(?=[ ,]|$)/i.test(originalDivision)
            )
        : names;

        if (filteredNames.length === 0) return null;

    return (
      <section key={division} className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {division} ({filteredNames.length})
        </h2>
        <ul className="list-disc list-inside">
          {filteredNames.map(({ name, isEmployee, originalDivision }, i) => {
            const isNinjaU = /ninja\s*u(?=[ ,]|$)/i.test(originalDivision);
            return (
              <li
                key={i}
                className={`${isEmployee ? "text-blue-600" : ""} ${isNinjaU ? "font-bold" : ""}`}
              >
                {name}
              </li>
            );
          })}
        </ul>
      </section>
    );
  })}
    </main>
  );
}
