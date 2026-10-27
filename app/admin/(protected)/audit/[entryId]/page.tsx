import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { AuditDetailClient } from "./_client";

interface AuditDetailPageProps {
  params: Promise<{ entryId: string }>;
}

export async function generateMetadata() {
  return metadataDaPagina("Audit Entry — Admin");
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { entryId } = await params;
  return <AuditDetailClient entryId={entryId} />;
}
