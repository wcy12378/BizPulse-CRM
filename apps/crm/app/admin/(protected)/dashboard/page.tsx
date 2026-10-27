import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { DashboardClient } from "./_client";

export async function generateMetadata() {
  return metadataDaPagina("Dashboard — Admin Plataforma");
}

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
