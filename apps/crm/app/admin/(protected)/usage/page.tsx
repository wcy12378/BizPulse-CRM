import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { UsageClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Uso & Custo — Admin Plataforma");
}

export default function AdminUsagePage() {
  return <UsageClient />;
}
