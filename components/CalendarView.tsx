"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Competition } from "@/types";
import { getGoogleCalendarLink } from "@/utils/googleCalendar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EventInput {
  title: string;
  start: string;
  end: string;
  url?: string;
  extendedProps?: {
    league?: string;
    type?: string;
    coach_attending?: string;
    results_url?: string;
    location?: string;
    google_map_url?: string;
    [key: string]: any;
  };
}

const leagueColors: Record<string, string> = {
  WNL: "#000000",
  NSC: "#005566",
  NCNS: "#CD5C5C",
  Misc: "#808080",
  // add your other leagues here
};

interface CalendarViewProps {
  competitions: Competition[];
}

function formatDateRange(startISO: string, endISO: string) {
  const startDate = new Date(startISO);
  const endDateRaw = new Date(endISO);

  // Subtract 1 day from the end date to display inclusive range
  const endDate = new Date(endDateRaw.getTime() - 24 * 60 * 60 * 1000);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const shortOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString(undefined, options);
  }

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

export default function CalendarView({ competitions }: CalendarViewProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string>("All");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase.from("competitions").select(
      `id, name, start_date, end_date, registration_url, league, type, coach_attending, results_url,
       gym:gyms(name, location, google_map_url)`
    );

    if (error) {
      console.error("Failed to load competitions:", error);
      return;
    }

    const formatted = data.map((comp: any) => {
      const start = comp.start_date;
      const endDateObj = new Date(comp.end_date);
      endDateObj.setDate(endDateObj.getDate() + 1); // add 1 day to end_date for FullCalendar

      return {
        title: comp.name,
        start: start,
        end: endDateObj.toISOString().split("T")[0], // add +1 day ISO string (date-only)
        url: comp.registration_url || undefined,
        backgroundColor: leagueColors[comp.league] || "#888",
        borderColor: leagueColors[comp.league] || "#888",
        extendedProps: {
          league: comp.league,
          type: comp.type,
          coach_attending: comp.coach_attending,
          results_url: comp.results_url,
          location: comp.gym?.location || "",
          google_map_url: comp.gym?.google_map_url || "",
        },
      };
    });

    setEvents(formatted);
  }

  return (
    <div className="p-4 max-w-5xl mx-auto bg-gray-600 rounded shadow min-h-screen">
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="mr-2 font-semibold">Filter by League:</span>

        {/* "All" toggle */}
        <button
          onClick={() => setSelectedLeague("All")}
          className={`px-3 py-1 rounded-full border font-medium ${
            selectedLeague === "All"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>

        {/* League toggles */}
        {Object.entries(leagueColors).map(([league, color]) => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={`px-3 py-1 rounded-full border font-medium flex items-center gap-2 ${
              selectedLeague === league
                ? "text-white"
                : "text-gray-800 hover:bg-gray-100"
            }`}
            style={{
              backgroundColor: selectedLeague === league ? color : "#f1f1f1",
              borderColor: color,
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {league}
          </button>
        ))}
      </div>

      <>
        <FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  dayMaxEventRows={true}
  dayMaxEvents={4}
  firstDay={1} // Start week on Monday
  height="auto"
  events={
    selectedLeague === "All"
      ? events
      : events.filter(
          (event) => event.extendedProps?.league === selectedLeague
        )
  }
  eventContent={(arg) => (
    <div className="text-xs px-1 py-0.5 leading-snug whitespace-normal break-words">
      {arg.event.title}
    </div>
  )}
  eventDidMount={(info) => {
    const league = info.event.extendedProps?.league;
    if (!league) return;

    const logoUrl = `/logos/${league}.png`; // logo path from /public/logos

    info.el.style.backgroundImage = `url(${logoUrl})`;
    info.el.style.backgroundSize = "cover";
    info.el.style.backgroundRepeat = "no-repeat";
    info.el.style.backgroundPosition = "center";
    info.el.style.color = "#fff";
    info.el.style.fontWeight = "bold";

    // Optional: Add a dark overlay for text readability
    info.el.style.position = "relative";
    info.el.innerHTML = `
      <div style="
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1;
        border-radius: 4px;
      "></div>
    `;
  }}
  eventClick={(info) => {
    info.jsEvent.preventDefault();

    setSelectedEvent({
      title: info.event.title,
      start: info.event.start ? info.event.start.toISOString() : "",
      end: info.event.end ? info.event.end.toISOString() : "",
      url: info.event.url || undefined,
      extendedProps: {
        league: info.event.extendedProps.league,
        type: info.event.extendedProps.type,
        coach_attending: info.event.extendedProps.coach_attending,
        results_url: info.event.extendedProps.results_url,
        location: info.event.extendedProps.location,
        google_map_url: info.event.extendedProps.google_map_url,
      },
    });

    setShowModal(true);
  }}
/>

        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 max-w-md w-full text-black">
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>

              {/* Date range as Google Calendar link */}
              <p>
                <strong>Dates: </strong>
                <a
                  href={getGoogleCalendarLink(
                    selectedEvent.title,
                    selectedEvent.start,
                    selectedEvent.end,
                    `League: ${
                      selectedEvent.extendedProps?.league || ""
                    }\nType: ${selectedEvent.extendedProps?.type || ""}`,
                    selectedEvent.extendedProps?.location || "",
                    selectedEvent.extendedProps?.google_map_url || ""
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  {formatDateRange(selectedEvent.start, selectedEvent.end)}
                </a>
              </p>

              {/* Additional event details */}
              {selectedEvent.extendedProps?.league && (
                <p>
                  <strong>League:</strong> {selectedEvent.extendedProps?.league}
                </p>
              )}
              {selectedEvent.extendedProps?.type && (
                <p>
                  <strong>Type:</strong> {selectedEvent.extendedProps?.type}
                </p>
              )}

              {selectedEvent.extendedProps?.coach_attending !== undefined && (
                <p className="flex items-center gap-1">
                  <strong>Coach Attending:</strong>
                  {selectedEvent.extendedProps?.coach_attending?.toLowerCase() ===
                  "yes" ? (
                    <span className="text-green-600">☑️</span>
                  ) : selectedEvent.extendedProps?.coach_attending?.toLowerCase() ===
                    "no" ? (
                    <span className="text-gray-500">⬜</span>
                  ) : (
                    <span className="text-yellow-500">❓</span>
                  )}
                </p>
              )}

              <div className="flex gap-6 mt-3">
                {selectedEvent.url && (
                  <a
                    href={selectedEvent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Registration Link
                  </a>
                )}

                {selectedEvent.extendedProps?.results_url && (
                  <a
                    href={selectedEvent.extendedProps?.results_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center underline text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    View Results&nbsp;
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                      />
                    </svg>
                  </a>
                )}
              </div>

              <div className="mt-4 text-right">
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
