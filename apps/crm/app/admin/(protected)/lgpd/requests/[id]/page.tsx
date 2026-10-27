import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { LgpdRequestAdminDetail } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Solicitação LGPD — Admin");
}

export default async function AdminLgpdRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LgpdRequestAdminDetail id={id} />;
}
