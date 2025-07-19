function formatGoogleDate(isoString: string) {
  const dt = new Date(isoString);
  // Format like 20250726T080000Z (UTC time, no punctuation)
  return dt.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function getGoogleCalendarLink(
  name: string,
  startDate: string,
  endDate: string,
  details: string,
  location: string,
  google_map_url: string
) {
  const start = formatGoogleDate(startDate);
  const end = formatGoogleDate(endDate);

  const params = new URLSearchParams({
    text: name,
    dates: `${start}/${end}`,
    details: details + (google_map_url ? `\nMap: ${google_map_url}` : ""),
    location,
  });

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`;
}