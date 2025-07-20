import CompetitionForm from "@/components/CompetitionForm";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCompetitionPage({ params }: EditPageProps) {
  const awaitedParams = await params;
  const id = awaitedParams.id;

  return <CompetitionForm id={id} />;
}
