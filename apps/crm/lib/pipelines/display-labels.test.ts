import { describe, expect, it } from "vitest";
import { traduzir } from "@/lib/i18n/dicionario";
import { pipelineDisplayName, stageDisplayName, pipelineVocabularyLabel } from "./display-labels";

describe("default pipeline display names", () => {
  it("renders seeded Portuguese records in Chinese and English without changing data", () => {
    const stage = { slug: "carrinho_abandonado", name: "Carrinho abandonado" };
    expect(stageDisplayName(stage, text => traduzir(text, "zh-CN"))).toBe("放弃购物车");
    expect(stageDisplayName(stage, text => traduzir(text, "en-US"))).toBe("Abandoned cart");
    expect(pipelineDisplayName({ slug: "pedidos", name: "Pedidos" }, text => traduzir(text, "zh-CN"))).toBe("订单");
    expect(pipelineDisplayName({ slug: "pedidos", name: "Pedidos" }, text => traduzir(text, "en-US"))).toBe("Orders");
    expect(stage.name).toBe("Carrinho abandonado");
  });
  it("preserves renamed stages and names that happen to match a translation", () => {
    const t = (text: string) => traduzir(text, "zh-CN");
    expect(stageDisplayName({ slug: "custom", name: "Carrinho abandonado" }, t)).toBe("Carrinho abandonado");
    expect(stageDisplayName({ slug: "entregue", name: "Kris交付" }, t)).toBe("Kris交付");
    expect(pipelineDisplayName({ slug: "custom", name: "Orders" }, t)).toBe("Orders");
    expect(pipelineDisplayName({ slug: "pedidos", name: "销售" }, t)).toBe("销售");
  });
  it("localizes default vocabulary without touching custom business terms", () => {
    const pipeline = { slug: "pedidos", name: "Pedidos" };
    expect(pipelineVocabularyLabel(pipeline, "lead", "Cliente", text => traduzir(text, "zh-CN"))).toBe("客户");
    expect(pipelineVocabularyLabel(pipeline, "won", "Pago", text => traduzir(text, "en-US"))).toBe("Paid");
    expect(pipelineVocabularyLabel(pipeline, "deal", "合同", text => traduzir(text, "en-US"))).toBe("合同");
  });
});
