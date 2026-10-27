import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { UsersClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Usuários — Admin Plataforma");
}

export default function AdminUsersPage() {
  return <UsersClient />;
}
