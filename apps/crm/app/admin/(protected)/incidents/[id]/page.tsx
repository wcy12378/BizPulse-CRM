import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { IncidentDetailClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Detalhe do Incidente — Admin Plataforma");
}

export default async function AdminIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IncidentDetailClient id={id} />;
}
