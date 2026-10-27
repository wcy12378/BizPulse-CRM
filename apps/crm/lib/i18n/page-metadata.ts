import type { Metadata } from "next";
import { loadAuthUser } from "@/lib/auth/server";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import type { Idioma } from "@/lib/i18n/idiomas";
import textos from "./traducoes/metadata-extra.json";

/** Reuses the request-cached user; metadata must not introduce authorization redirects. */
export async function idiomaDaMetadata(): Promise<Idioma> {
  const user = await loadAuthUser();
  return user?.idioma ?? idiomaDoVisitante(null);
}

function texto(text: keyof typeof textos, idioma: Idioma): string {
  return textos[text][idioma];
}

type ComplementoDaMetadata = Omit<Metadata, "title" | "description"> & {
  description?: keyof typeof textos;
};

/** Translate catalog copy while preserving route-specific robots, Open Graph and other fields. */
export async function metadataDaPagina(
  title: keyof typeof textos,
  complemento: ComplementoDaMetadata = {},
): Promise<Metadata> {
  const idioma = await idiomaDaMetadata();
  const { description, ...restante } = complemento;
  return {
    ...restante,
    title: texto(title, idioma),
    ...(description === undefined ? {} : { description: texto(description, idioma) }),
  };
}

/** Branding remains runtime data; wording describes capabilities without certifying compliance. */
export function metadataDaMarca(name: string, idioma: Idioma): Metadata {
  return {
    title: {
      default: `${name} — ${texto("atendimento e vendas por WhatsApp com agentes de IA", idioma)}`,
      template: `%s · ${name}`,
    },
    description: texto("Descrição da instalação", idioma),
    keywords: [
      "CRM",
      texto("atendimento", idioma),
      "WhatsApp",
      texto("IA conversacional", idioma),
      "LGPD",
      "multi-tenant",
    ],
  };
}
