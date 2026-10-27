export type MoneyTotal = { currency: string; valueCents: number };

/** Different currencies are displayed separately; no implied exchange conversion. */
export function moneyTotals(rows: ReadonlyArray<{ currency: string | null; value_cents: number | null }>): MoneyTotal[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const currency = /^[A-Z]{3}$/.test(row.currency ?? "") ? row.currency! : "XXX";
    const cents = Number.isFinite(row.value_cents) ? row.value_cents! : 0;
    totals.set(currency, (totals.get(currency) ?? 0) + cents);
  }
  return [...totals].sort(([a], [b]) => a.localeCompare(b)).map(([currency, valueCents]) => ({ currency, valueCents }));
}

export function formatMoneyTotals(totals: MoneyTotal[] | null | undefined, locale: string): string {
  if (!Array.isArray(totals) || !totals.length) return new Intl.NumberFormat(locale).format(0);
  return totals.map(total => new Intl.NumberFormat(locale, {
    style: "currency", currency: total.currency, maximumFractionDigits: 0,
  }).format(total.valueCents / 100)).join(" · ");
}
