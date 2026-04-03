import FeatureDetailPage, { getAllFeatureSlugs } from "@/components/featurespage/FeatureDetailPage";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllFeatureSlugs().map((slug) => ({ slug }));
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allSlugs = getAllFeatureSlugs();

  if (!allSlugs.includes(slug)) {
    notFound();
  }

  return <FeatureDetailPage slug={slug} />;
}
