import CompetitionForm from "@/components/CompetitionForm";

interface EditPageProps {
  params: { id: string };
}

// Mark the page component as async
export default async function EditCompetitionPage({ params }: EditPageProps) {
  // Await params (which is now a Promise-like object)
  const awaitedParams = await params;
  const id = awaitedParams.id;

  return <CompetitionForm id={id} />;
}
