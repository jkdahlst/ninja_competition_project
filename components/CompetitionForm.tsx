"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Competition {
  id?: string;
  name: string;
  start_date: string;
  end_date?: string;
  gym?: number;
  league?: string;
  type?: string;
  registration_url?: string;
  results_url?: string;
  coach_attending?: "yes" | "no" | "maybe" | null;
}

interface Gym {
  id: number;
  name: string;
}

const leagueOptions = ["WNL", "NCNS", "MNS", "NSC", "FINA", "Misc", "UNAA"];

interface CompetitionFormProps {
  id?: string;
}

export default function CompetitionForm({ id }: CompetitionFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<Partial<Competition>>({});
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("gyms")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) console.error("Error fetching gyms:", error);
        else setGyms(data || []);
      });
  }, []);

  useEffect(() => {
    if (id) {
      supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching competition:", error);
            alert("Failed to load competition data.");
          } else {
            setFormState(data || {});
          }
          setLoading(false);
        });
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formState.name || !formState.start_date) {
      alert("Please fill out required fields (Name and Start Date).");
      return;
    }

    setSubmitting(true);

    if (id) {
      const { error } = await supabase
        .from("competitions")
        .update({
          ...formState,
          gym: formState.gym ? Number(formState.gym) : null,
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating competition:", error);
        alert("Failed to update competition.");
      } else {
        alert("Competition updated!");
        router.push("/");
      }
    } else {
      const { error } = await supabase
        .from("competitions")
        .insert({
          ...formState,
          gym: formState.gym ? Number(formState.gym) : null,
        });

      if (error) {
        console.error("Error creating competition:", error);
        alert("Failed to create competition.");
      } else {
        alert("Competition created!");
        router.push("/");
      }
    }

    setSubmitting(false);
  }

  async function handleDelete() {
    if (!id) return;

    if (!confirm("Are you sure you want to delete this competition?")) return;

    setSubmitting(true);

    const { error } = await supabase.from("competitions").delete().eq("id", id);

    setSubmitting(false);

    if (error) {
      console.error("Error deleting competition:", error);
      alert("Failed to delete competition.");
    } else {
      alert("Competition deleted.");
      router.push("/");
    }
  }

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <main className="p-6 max-w-xl mx-auto bg-gray-600 text-[#FFD700] font-sans min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#FFE933]">
        {id ? "Edit Competition" : "Create Competition"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1">Name</label>
          <Input
            value={formState.name || ""}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
            required
          />
        </div>

        {/* Dates */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">Start Date</label>
            <Input
              type="date"
              value={formState.start_date || ""}
              onChange={(e) =>
                setFormState({ ...formState, start_date: e.target.value })
              }
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">End Date</label>
            <Input
              type="date"
              value={formState.end_date || ""}
              onChange={(e) =>
                setFormState({ ...formState, end_date: e.target.value })
              }
            />
          </div>
        </div>

        {/* Gym */}
        <div>
          <label className="block mb-1">Gym</label>
          <select
            value={formState.gym || ""}
            onChange={(e) =>
              setFormState({ ...formState, gym: Number(e.target.value) })
            }
            className="w-full p-2 rounded bg-[#303036] text-white"
          >
            <option value="">Select a gym</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
        </div>

        {/* League */}
        <div>
          <label className="block mb-1">League</label>
          <select
            value={formState.league || ""}
            onChange={(e) =>
              setFormState({ ...formState, league: e.target.value })
            }
            className="w-full p-2 rounded bg-[#303036] text-white"
          >
            <option value="">Select League</option>
            {leagueOptions.map((league) => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block mb-1">Type</label>
          <Input
            value={formState.type || ""}
            onChange={(e) =>
              setFormState({ ...formState, type: e.target.value })
            }
          />
        </div>

        {/* Registration URL */}
        <div>
          <label className="block mb-1">Registration URL</label>
          <Input
            value={formState.registration_url || ""}
            onChange={(e) =>
              setFormState({ ...formState, registration_url: e.target.value })
            }
          />
        </div>

        {/* Results URL */}
        <div>
          <label className="block mb-1">Results URL</label>
          <Input
            value={formState.results_url || ""}
            onChange={(e) =>
              setFormState({ ...formState, results_url: e.target.value })
            }
          />
        </div>

        {/* Coach Attending */}
        <div>
          <label className="block mb-1">Coach Attending</label>
          <select
            value={formState.coach_attending || ""}
            onChange={(e) =>
              setFormState({
                ...formState,
                coach_attending: e.target.value as "yes" | "no" | "maybe",
              })
            }
            className="w-full p-2 rounded bg-[#303036] text-white"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>

        <div className="flex gap-4 mt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting
              ? "Saving..."
              : id
              ? "Save Changes"
              : "Create Competition"}
          </Button>

          {id && (
            <Button
              variant="destructive"
              type="button"
              disabled={submitting}
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}
