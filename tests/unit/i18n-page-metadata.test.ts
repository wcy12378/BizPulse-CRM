import { beforeEach, describe, expect, it, vi } from "vitest";
import { idiomaDaMetadata, metadataDaMarca, metadataDaPagina } from "@/lib/i18n/page-metadata";
const state = vi.hoisted(() => ({
  user: null as null | { idioma: "zh-CN" | "en-US" },
  visitor: "zh-CN" as "zh-CN" | "en-US",
}));
vi.mock("@/lib/auth/server", () => ({ loadAuthUser: vi.fn(async () => state.user) }));
vi.mock("@/lib/i18n/idiomaAnonimo", () => ({
  idiomaDoVisitante: vi.fn(async () => state.visitor),
}));

describe("localized page metadata", () => {
  beforeEach(() => {
    state.user = null;
    state.visitor = "zh-CN";
  });
  it("uses the effective user language before visitor language", async () => {
    state.user = { idioma: "en-US" };
    expect(await idiomaDaMetadata()).toBe("en-US");
    expect(await metadataDaPagina("首页")).toEqual({ title: "Home" });
  });
  it("uses the anonymous language and Chinese default", async () => {
    expect(await metadataDaPagina("Configurações")).toEqual({ title: "设置" });
    state.visitor = "en-US";
    expect(await metadataDaPagina("Configurações")).toEqual({ title: "Settings" });
  });
  it.each(["zh-CN", "en-US"] as const)(
    "preserves the injected brand and title template in %s",
    (idioma) => {
      const metadata = metadataDaMarca("Custom Brand", idioma);
      expect(metadata.title).toMatchObject({ template: "%s · Custom Brand" });
      expect((metadata.title as { default: string }).default).toContain("Custom Brand");
      expect(metadata.description).not.toMatch(/brasileiras|LGPD-nativo|合规认证|compliant/);
      expect(metadata.description).toContain("WhatsApp");
      expect(metadata.description).toContain("LGPD");
    },
  );
  it("localizes workbench and existing settings titles", async () => {
    for (const title of [
      "Agent–CRM 工作台",
      "Marca",
      "Conversões",
      "Atualização do sistema",
      "Tags",
      "Meta Ads",
    ]) {
      expect((await metadataDaPagina(title)).title).toBeTruthy();
    }
    state.user = { idioma: "en-US" };
    expect((await metadataDaPagina("Agent–CRM 工作台")).title).toBe("Agent–CRM Workbench");
  });
});
