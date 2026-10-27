import { metadataDaPagina } from "@/lib/i18n/page-metadata";

import { VitrineDaAgenda } from "./_client";

/**
 * Vitrine do kit visual da Agenda — componentes com dados de mentira.
 *
 * Por que NÃO vive sob `/design`: aquela rota tem layout próprio
 * (`app/design/layout.tsx`) que injeta um `VariantProvider` capaz de trocar
 * paleta, tipografia e densidade em runtime. É o showcase de EXPLORAÇÃO, e uma
 * medição de cor ou de fonte feita lá dentro descreveria a variante escolhida
 * no seletor, não o produto. Aqui a página herda só o layout raiz — os tokens
 * reais, a Atkinson real, o mesmo script de tema do app.
 *
 * Também não vive sob `app/app/**`: lá dentro toda rota precisa de porta na
 * navegação (`tests/unit/navegacao-completude.test.ts`), e uma vitrine no menu
 * do cliente seria exatamente o tipo de tela que não deveria estar lá.
 */
export async function generateMetadata() {
  return metadataDaPagina("Kit visual da Agenda", {
    robots: { index: false, follow: false },
  });
}

export default function VitrineDaAgendaPage() {
  return <VitrineDaAgenda />;
}
