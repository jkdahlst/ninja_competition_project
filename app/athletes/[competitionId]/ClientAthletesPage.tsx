"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Athlete {
  Name: string;
  Division: string;
}

function parseCSV(text: string): Athlete[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values =
      line
        .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        ?.map((v) => v.replace(/^"|"$/g, "").trim()) || [];
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] || "";
    });
    return obj as Athlete;
  });
}

function extractDivision(fullDivision: string | undefined) {
  if (!fullDivision) return "Unknown";
  const parts = fullDivision.trim().split(/\s+/);
  return parts.length >= 2 ? parts.slice(-2).join(" ") : fullDivision.trim();
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
  const [groupedAthletes, setGroupedAthletes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const athletes = parseCSV(csv);

        const grouped = athletes.reduce((acc: Record<string, string[]>, athlete) => {
          const div = extractDivision(athlete.Division);
          if (!acc[div]) acc[div] = [];
          acc[div].push(athlete.Name);
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
      <h1 className="text-2xl font-bold mb-6">Athletes by Division</h1>

      {Object.entries(groupedAthletes).length === 0 && <p>No athletes found.</p>}

      {Object.entries(groupedAthletes)
        .sort(([a], [b]) => divisionSortKey(a) - divisionSortKey(b))
        .map(([division, names]) => (
          <section key={division} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {division} ({names.length})
            </h2>
            <ul className="list-disc list-inside">
              {names.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </section>
        ))}
    </main>
  );
}
