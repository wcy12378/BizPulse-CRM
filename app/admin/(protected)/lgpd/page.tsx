import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { LgpdAdminClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("LGPD — Admin");
}

export default function AdminLgpdPage() {
  return <LgpdAdminClient />;
}
