import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { ContactsListClient } from "./_client";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadataDaPagina("Contatos");
}

export default function ContactsPage() {
  return <ContactsListClient />;
}
