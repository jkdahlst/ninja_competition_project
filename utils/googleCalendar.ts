export function getGoogleCalendarLink(
    name: string,
    startDate: string,
    endDate: string,
    details: string,
    location: string,
    google_map_url: string
  ) {
    const start = new Date(startDate).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d+/g, "");

    const params = new URLSearchParams({
      text: name,
      dates: `${start}/${end}`,
      details: `${google_map_url}`,
      location,
    });

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`;
  }