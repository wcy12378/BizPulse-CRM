import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { IncidentsClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Incidentes — Admin Plataforma");
}

export default function AdminIncidentsPage() {
  return <IncidentsClient />;
}
