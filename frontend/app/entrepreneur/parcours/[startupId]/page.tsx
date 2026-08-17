import { StartupJourneyPageClient } from "@/features/projets/components/journey/StartupJourneyPageClient";

export default async function StartupJourneyPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  return <StartupJourneyPageClient startupId={startupId} />;
}