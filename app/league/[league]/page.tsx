// app/league/[league]/page.tsx

import Image from "next/image";

export const dynamic = "force-dynamic"; // or 'auto', depending on preference

interface Props {
  params: Promise<{ league: string }>;
}

export default async function LeaguePage({ params }: Props) {
  const { league } = await params;

  const leagueDescriptions: Record<string, JSX.Element> = {
    WNL: (
      <>
        <h1 className="text-3xl font-bold mb-4">World Ninja League (WNL)</h1>
        <p className="text-lg leading-7 mb-4">
          World Ninja League (WNL) is one of the premier ninja competition leagues.
        </p>
        <p>📅 WNL hosts multiple tiers of events with national-level finals each season.</p>
      </>
    ),
    NCNS: (
      <>
        <h1 className="text-3xl font-bold mb-4">North Central Ninja Series (NCNS)</h1>
        <p className="text-lg leading-7 mb-4">
          NCNS is a regional league connecting gyms across the Midwest.
        </p>
        <p>🌽 Includes events in Iowa, Minnesota, and nearby states.</p>
      </>
    ),
    // Add others: MNS, NSC, FINA, UNAA, Barn, BoC...
  };

  const content = leagueDescriptions[league] || (
    <>
      <h1 className="text-3xl font-bold mb-4">{league} League</h1>
      <p className="text-lg leading-7">League information not found.</p>
    </>
  );

  return (
    <main className="p-4 max-w-2xl mx-auto bg-gray-600 min-h-screen text-[#FFE933] font-sans">
      <div className="flex items-center justify-center mb-6 gap-4">
        <Image
          src="https://ninjau.com/wp-content/uploads/2018/09/ninja-u-mobile-logo.png"
          alt="NinjaU Logo"
          width={128}
          height={128}
        />
        <h1 className="text-3xl font-bold text-[#FFE933] whitespace-nowrap">Competitions</h1>
      </div>

      <section className="bg-gray-600 text-[#FFE933]">{content}</section>
    </main>
  );
}
