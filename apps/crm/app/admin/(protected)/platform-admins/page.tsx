import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { PlatformAdminsClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Platform Admins — Admin Plataforma");
}

export default function AdminPlatformAdminsPage() {
  return <PlatformAdminsClient />;
}
