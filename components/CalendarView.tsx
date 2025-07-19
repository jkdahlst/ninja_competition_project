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
      endDateObj.setDate(endDateObj.getDate() + 1); // add 1 day to end date

      return {
        title: comp.name,
        start,
        end: endDateObj.toISOString().split("T")[0],
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
          height="auto"
          eventContent={(arg) => (
            <div className="text-xs px-1 py-0.5 leading-snug whitespace-normal break-words">
              {arg.event.title}
            </div>
          )}
          events={
            selectedLeague === "All"
              ? events
              : events.filter(
                  (event) => event.extendedProps?.league === selectedLeague
                )
          }
          eventClick={(info) => {
            info.jsEvent.preventDefault();

            setSelectedEvent({
              title: info.event.title,
              start: info.event.start?.toISOString() || "",
              end: info.event.end?.toISOString() || "",
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
              <p>
                <strong>Dates:</strong>{" "}
                {new Date(selectedEvent.start).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                –{" "}
                {new Date(selectedEvent.end).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              {selectedEvent.extendedProps?.league && (
                <p>
                  <strong>League:</strong> {selectedEvent.extendedProps.league}
                </p>
              )}
              {selectedEvent.extendedProps?.type && (
                <p>
                  <strong>Type:</strong> {selectedEvent.extendedProps.type}
                </p>
              )}

              {selectedEvent.extendedProps?.coach_attending !== undefined && (
                <p className="flex items-center gap-1">
                  <strong>Coach Attending:</strong>
                  {selectedEvent.extendedProps.coach_attending?.toLowerCase() ===
                  "yes" ? (
                    <span className="text-green-600">☑️</span>
                  ) : selectedEvent.extendedProps.coach_attending?.toLowerCase() ===
                    "no" ? (
                    <span className="text-gray-500">⬜</span>
                  ) : (
                    <span className="text-yellow-500">❓</span>
                  )}
                </p>
              )}

              {selectedEvent.url && (
                <p>
                  <a
                    href={selectedEvent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Registration Link
                  </a>
                </p>
              )}

              {selectedEvent.extendedProps?.results_url && (
                <p>
                  <a
                    href={selectedEvent.extendedProps.results_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center underline text-purple-700 hover:text-purple-900"
                  >
                    View Results&nbsp;📊
                  </a>
                </p>
              )}

              {/* Google Calendar Link */}
              <p>
                <a
                  href={getGoogleCalendarLink(
                    selectedEvent.title,
                    selectedEvent.start,
                    selectedEvent.end,
                    `League: ${selectedEvent.extendedProps?.league || ""}\nType: ${
                      selectedEvent.extendedProps?.type || ""
                    }`,
                    selectedEvent.extendedProps?.location || "",
                    selectedEvent.extendedProps?.google_map_url || ""
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  Add to Google Calendar
                </a>
              </p>

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
