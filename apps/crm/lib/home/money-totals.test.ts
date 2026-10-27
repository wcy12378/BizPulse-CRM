import { expect, it } from "vitest";
import { formatMoneyTotals, moneyTotals } from "./money-totals";

it("keeps USD and CNY separate rather than displaying a fictitious currency sum", () => {
  const result = moneyTotals([{ currency: "USD", value_cents: 1920000 }, { currency: "CNY", value_cents: 10000 }, { currency: "USD", value_cents: 100 }]);
  expect(result).toEqual([{ currency: "CNY", valueCents: 10000 }, { currency: "USD", valueCents: 1920100 }]);
  const displayed = formatMoneyTotals(result, "en-US");
  expect(displayed).toContain("$19,201");
  expect(displayed).toContain("100");
});
it("renders empty and incomplete amounts without throwing or inventing an exchange rate", () => {
  expect(formatMoneyTotals([], "zh-CN")).toBe("0");
  expect(formatMoneyTotals(undefined, "en-US")).toBe("0");
  expect(moneyTotals([{ currency: null, value_cents: null }])).toEqual([{ currency: "XXX", valueCents: 0 }]);
});
