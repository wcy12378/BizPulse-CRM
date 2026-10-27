import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { notFound } from "next/navigation";

import { loadAuthUser } from "@/lib/auth/server";
import { UpdatePanel } from "./_components/UpdatePanel";

export async function generateMetadata() {
  return metadataDaPagina("Atualização do sistema");
}
export const dynamic = "force-dynamic";

/**
 * Só o dono do servidor. Um `notFound()` em vez de uma tela de "sem permissão"
 * porque, para quem não é dono, esta página simplesmente não faz parte do
 * produto.
 */
export default async function Page() {
  const user = await loadAuthUser();
  if (!user?.is_platform_admin) notFound();
  return <UpdatePanel />;
}
