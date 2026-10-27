// @vitest-environment node
import { describe, expect, it } from "vitest";
import { customFieldSchema } from "@/lib/schemas/settings";
import extra from "@/lib/i18n/traducoes/config-extra.json";
import {
  opcoesDeFusoHorario,
  rotuloDoFusoHorario,
  ROTULOS_DE_TIPO_DE_CAMPO,
} from "./_option-labels";

describe("settings option presentation", () => {
  it("offers Shanghai with Chinese and English display labels but stores the IANA zone", () => {
    const zones = opcoesDeFusoHorario("Asia/Shanghai");
    expect(zones.filter((zone) => zone === "Asia/Shanghai")).toHaveLength(1);
    const label = rotuloDoFusoHorario("Asia/Shanghai");
    expect(extra[label as keyof typeof extra]).toEqual({
      "zh-CN": "上海（UTC+08:00）",
      "en-US": "Shanghai (UTC+08:00)",
    });
    for (const zone of zones) {
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: zone })).not.toThrow();
      expect(extra).toHaveProperty(rotuloDoFusoHorario(zone));
    }
  });

  it("preserves existing zones outside the suggestions without inventing a translated value", () => {
    const zone = "Pacific/Auckland";
    expect(opcoesDeFusoHorario(zone)).toContain(zone);
    expect(rotuloDoFusoHorario(zone)).toBe(zone);
    expect(opcoesDeFusoHorario("")).not.toContain("");
  });

  it("translates the legal country display name without replacing its ISO code", () => {
    expect(extra.Brasil).toEqual({ "zh-CN": "巴西", "en-US": "Brazil" });
  });

  it("has presentation labels for all schema field types while preserving enum values", () => {
    for (const type of customFieldSchema.shape.type.options) {
      expect(ROTULOS_DE_TIPO_DE_CAMPO[type], type).toBeTruthy();
      expect(ROTULOS_DE_TIPO_DE_CAMPO[type], type).not.toBe(type);
    }
  });
});
