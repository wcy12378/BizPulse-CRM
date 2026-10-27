import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import catalog from "@/lib/i18n/traducoes/metadata-extra.json";
import { metadataDaPagina } from "@/lib/i18n/page-metadata";

const state = vi.hoisted(() => ({ idioma: "zh-CN" as "zh-CN" | "en-US" }));
vi.mock("@/lib/auth/server", () => ({ loadAuthUser: vi.fn(async () => null) }));
vi.mock("@/lib/i18n/idiomaAnonimo", () => ({
  idiomaDoVisitante: vi.fn(async () => state.idioma),
}));

const localizedRoutes = [
  "app/(public)/login/forgot/page.tsx",
  "app/(public)/login/mfa/page.tsx",
  "app/(public)/login/page.tsx",
  "app/(public)/login/recovery/page.tsx",
  "app/(public)/login/reset/page.tsx",
  "app/(public)/signup/page.tsx",
  "app/account-suspended/page.tsx",
  "app/acesso-revogado/page.tsx",
  "app/admin/(protected)/audit/page.tsx",
  "app/admin/(protected)/audit/[entryId]/page.tsx",
  "app/admin/(protected)/cadastro/page.tsx",
  "app/admin/(protected)/configuracao/page.tsx",
  "app/admin/(protected)/dashboard/page.tsx",
  "app/admin/(protected)/destinos-internos/page.tsx",
  "app/admin/(protected)/email/page.tsx",
  "app/admin/(protected)/extensoes/page.tsx",
  "app/admin/(protected)/google/page.tsx",
  "app/admin/(protected)/incidents/page.tsx",
  "app/admin/(protected)/incidents/[id]/page.tsx",
  "app/admin/(protected)/lgpd/page.tsx",
  "app/admin/(protected)/lgpd/requests/[id]/page.tsx",
  "app/admin/(protected)/marca/page.tsx",
  "app/admin/(protected)/meta/page.tsx",
  "app/admin/(protected)/platform-admins/page.tsx",
  "app/admin/(protected)/sistema/page.tsx",
  "app/admin/(protected)/tenants/new/page.tsx",
  "app/admin/(protected)/tenants/page.tsx",
  "app/admin/(protected)/usage/page.tsx",
  "app/admin/(protected)/users/page.tsx",
  "app/admin/(protected)/users/[id]/page.tsx",
  "app/admin/forbidden/page.tsx",
  "app/app/activities/page.tsx",
  "app/app/ads/meta/page.tsx",
  "app/app/ai/cases/avisos/page.tsx",
  "app/app/ai/page.tsx",
  "app/app/analise/page.tsx",
  "app/app/audit/page.tsx",
  "app/app/connections/page.tsx",
  "app/app/contacts/page.tsx",
  "app/app/crm/page.tsx",
  "app/app/extensions/page.tsx",
  "app/app/extensions/[id]/page.tsx",
  "app/app/inbox/page.tsx",
  "app/app/integracao-dados/page.tsx",
  "app/app/kanban/page.tsx",
  "app/app/metrics/page.tsx",
  "app/app/products/page.tsx",
  "app/app/prospecting/page.tsx",
  "app/app/radar/page.tsx",
  "app/app/tasks/page.tsx",
  "app/app/team/page.tsx",
  "app/app/templates/page.tsx",
  "app/app/webhooks/page.tsx",
  "app/design/layout.tsx",
  "app/legal/privacy/page.tsx",
  "app/legal/terms/page.tsx",
  "app/vitrine-agenda/page.tsx"
] as const;

describe("static route metadata language coverage", () => {
  beforeEach(() => { state.idioma = "zh-CN"; });

  it.each(localizedRoutes)("localizes the title of %s in both supported languages", async (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");
    expect(source).not.toMatch(/export const metadata\b/);
    const match = /metadataDaPagina\("([^"]+)"/.exec(source);
    expect(match).not.toBeNull();
    const key = match![1] as keyof typeof catalog;
    expect(catalog).toHaveProperty(key);
    for (const idioma of ["zh-CN", "en-US"] as const) {
      state.idioma = idioma;
      expect((await metadataDaPagina(key)).title).toBe(catalog[key][idioma]);
      expect(catalog[key][idioma]).toBeTruthy();
    }
  });

  it("uses actual Chinese and English titles for core routes", async () => {
    expect((await metadataDaPagina("Contatos")).title).toBe("联系人");
    expect((await metadataDaPagina("Funis")).title).toBe("销售漏斗");
    expect((await metadataDaPagina("Entrar")).title).toBe("登录");
    state.idioma = "en-US";
    expect((await metadataDaPagina("Contatos")).title).toBe("Contacts");
    expect((await metadataDaPagina("Funis")).title).toBe("Pipelines");
    expect((await metadataDaPagina("Entrar")).title).toBe("Sign in");
  });

  it.each(["zh-CN", "en-US"] as const)("localizes descriptions and preserves metadata fields in %s", async (idioma) => {
    state.idioma = idioma;
    const robots = { index: false, follow: false };
    const openGraph = { siteName: "Custom Brand", images: ["/brand.png"] };
    const metadata = await metadataDaPagina("Design Showcase — Pi Native CRM", {
      description: "Painel navegável de design system. Soft-tech / calmo.",
      robots,
      openGraph,
    });
    expect(metadata.description).toBe(catalog["Painel navegável de design system. Soft-tech / calmo."][idioma]);
    expect(metadata.robots).toEqual(robots);
    expect(metadata.openGraph).toEqual(openGraph);
    expect(metadata.title).toContain("Pi Native CRM");
  });
});
