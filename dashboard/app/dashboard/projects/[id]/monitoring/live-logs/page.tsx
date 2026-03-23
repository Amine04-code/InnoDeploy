import { redirect } from "next/navigation";

export default async function ProjectLiveLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/projects/${encodeURIComponent(id)}?tab=Logs&mode=live`);
}
