import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { AuditClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Audit Log — Admin");
}

export default function AdminAuditPage() {
  return <AuditClient />;
}
