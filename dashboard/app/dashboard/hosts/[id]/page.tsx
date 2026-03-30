import { redirect } from "next/navigation";

export default async function HostDetailAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/hosts?hostId=${encodeURIComponent(id)}`);
}
