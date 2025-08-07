// types.ts (place this file at your project root)

export interface Gym {
  id: number;
  name: string;
  url: string;
  location: string;
  google_map_url: string;
}

export interface Competition {
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
  athlete_sheet_url?: string; // make it optional if it can be null
  format?: string;
}
