import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { redirect } from "next/navigation";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { ProspectingClient } from "./_client";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadataDaPagina("Prospecção");
}
export default async function ProspectingPage() {
  const user = await requireAuth();
  const org = await resolveActiveOrg(user);
  if (org?.role !== "admin") redirect("/app/inbox");
  return <ProspectingClient />;
}
