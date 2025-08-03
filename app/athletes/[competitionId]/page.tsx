import ClientAthletesPage from "./ClientAthletesPage";

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const resolvedParams = await params;
  return <ClientAthletesPage competitionId={resolvedParams.competitionId} />;
}
