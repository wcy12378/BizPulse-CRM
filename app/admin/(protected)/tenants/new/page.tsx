import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { NewTenantForm } from "./_form";

export async function generateMetadata() {
  return metadataDaPagina("Novo Tenant — Admin Plataforma");
}

export default function NewTenantPage() {
  return <NewTenantForm />;
}
