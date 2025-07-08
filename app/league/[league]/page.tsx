import Link from "next/link";

interface Props {
  params: {
    league: string;
  };
}

export default async function LeaguePage(context: { params: { league: string } }) {
  const { league } = await context.params; // ✅ await params

  const leagueDescriptions: Record<string, JSX.Element> = {
    WNL: <p>The World Ninja League (WNL) hosts national-level ninja competitions.</p>,
    NCNS: <p>North Central Ninja Series (NCNS) is a regional league featuring gyms in the Midwest.</p>,
    MNS: <p>Midwest Ninja Series (MNS) provides competitive opportunities across central states.</p>,
    NSC: <p>Ninja Sport Championship (NSC) combines skill and strategy for elite ninjas.</p>,
    FINA: <p>FINA is a national organization hosting ninja obstacle events around the country.</p>,
    UNAA: <p>UNAA (Ultimate Ninja Athlete Association) runs a global ninja competition circuit.</p>,
    Barn: <p>The Barn League hosts grassroots ninja events in a friendly, fun format.</p>,
    BoC: <p>Bucket of Chalk (BoC) brings creative, non-traditional ninja competitions.</p>,
  };

  const leagueLinks: Record<string, string> = {
    WNL: "http://worldninjaleague.org/",
    NCNS: "https://www.thencns.com/",
    MNS: "https://www.obstacle-academy.com/midwest-ninja-series",
    NSC: "https://www.ninjasportnetwork.com/",
    FINA: "https://www.fina.ninja/",
    UNAA: "https://ultimateninja.net/",
    Barn: "https://www.instagram.com/thebarn.ninja/?hl=en", 
    BoC: "https://bucketofchalk.com/",
  };

  const description = leagueDescriptions[league];
  const externalLink = leagueLinks[league];

  return (
    <main className="p-4 max-w-2xl mx-auto bg-gray-600 min-h-screen text-[#FFE933] font-sans">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">{league} League</h1>
        {description}
        {externalLink && (
          <div className="mt-4">
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-[#FFE933] text-black font-semibold rounded hover:bg-yellow-400 transition"
            >
              Visit {league} Website
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
