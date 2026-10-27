import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { IDIOMAS, normalizarIdioma, parseAcceptLanguage } from "./idiomas";
import { localeDeData, tagDeIdioma } from "./datas";
import { IdiomaProvider, useT } from "./IdiomaProvider";
import { profileSchema, tenantSchema } from "@/lib/schemas/settings";
import { DICIONARIO } from "./dicionario";

afterEach(cleanup);
it("offers only Chinese and English, normalizing old preferences to Chinese", () => {
  expect(IDIOMAS).toEqual(["zh-CN", "en-US"]);
  for (const legacy of ["pt-BR", "es", "fr", null]) expect(normalizarIdioma(legacy)).toBe("zh-CN");
  expect(parseAcceptLanguage("pt-BR,es;q=0.9,en-GB;q=0.8")).toBe("en-US");
  expect(profileSchema.shape.locale.safeParse("en-US").success).toBe(true);
  expect(tenantSchema.shape.locale.safeParse("pt-BR").success).toBe(false);
  expect(tagDeIdioma("en-US")).toBe("en-US");
  expect(localeDeData("en-US").code).toBe("en-US");
});
function Label() { const t=useT(); return <span>{t("Configurações")}</span>; }
it("defaults isolated configuration components to Chinese", () => {
  render(<Label />); expect(screen.getByText("设置")).toBeInTheDocument();
});
it("translates English settings labels and dates through the same provider", () => {
  render(<IdiomaProvider locale="en-US"><Label /></IdiomaProvider>);
  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(document.documentElement.lang).toBe("en-US");
});

it("provides both supported translations for every registered UI message", () => {
  const missing = Object.entries(DICIONARIO).flatMap(([key, translations]) =>
    ["zh-CN", "en-US"].filter(locale => !translations[locale as "zh-CN" | "en-US"]?.trim()).map(locale => `${locale}: ${key}`),
  );
  expect(missing).toEqual([]);
});

it("preserves named placeholders in English translations", () => {
  const placeholders = (text: string) => (text.match(/\{\{?[\w.-]+\}?\}|%[sd]/g) ?? []).sort();
  const changed = Object.entries(DICIONARIO).filter(([key, translations]) =>
    translations["en-US"] && JSON.stringify(placeholders(key)) !== JSON.stringify(placeholders(translations["en-US"]!)),
  ).map(([key]) => key);
  expect(changed).toEqual([]);
});
