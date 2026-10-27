import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { TenantsClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Tenants — Admin Plataforma");
}

export default function AdminTenantsPage() {
  return <TenantsClient />;
}
