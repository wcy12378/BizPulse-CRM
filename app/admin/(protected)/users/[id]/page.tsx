import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { UserDetailClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Detalhe de Usuário — Admin Plataforma");
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailClient id={id} />;
}
