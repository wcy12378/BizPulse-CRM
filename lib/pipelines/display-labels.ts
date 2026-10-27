type NamedRecord = { name: string; slug?: string };
type Translate = (text: string) => string;

const DEFAULT_STAGES: Readonly<Record<string, readonly string[]>> = {
  inquiry: ["Inquiry"],
  qualified: ["Qualified"],
  quotation: ["Quotation"],
  negotiation: ["Negotiation"],
  won: ["Won"],
  lost: ["Lost"],
  carrinho_abandonado: ["Carrinho abandonado", "Abandoned cart"],
  aguardando_pagamento: ["Aguardando pagamento", "Awaiting payment"],
  pago: ["Pago", "Paid"],
  em_separacao: ["Em separação", "Em separacao", "Preparing order"],
  enviado: ["Enviado", "Shipped"],
  entregue: ["Entregue", "Delivered"],
  pos_venda: ["Pós-venda", "Pos-venda", "After-sales"],
  cancelado: ["Cancelado", "Cancelled"],
};

/** Translate known installation defaults only; renamed/customer records stay verbatim. */
export function pipelineDisplayName(record: NamedRecord, t: Translate): string {
  if (record.slug === "demo-b2b-export" && record.name === "B2B Export Demo") return t(record.name);
  return record.slug === "pedidos" && ["Pedidos", "Orders"].includes(record.name)
    ? t("Orders")
    : record.name;
}

export function stageDisplayName(record: NamedRecord, t: Translate): string {
  const defaults = record.slug ? DEFAULT_STAGES[record.slug] : undefined;
  return defaults?.includes(record.name) ? t(defaults[defaults.length - 1]!) : record.name;
}

const DEFAULT_VOCABULARY = {
  lead: ["Cliente", "Lead", "Customer"],
  deal: ["Pedido", "Deal", "Order"],
  won: ["Pago", "Ganho", "Paid"],
  lost: ["Cancelado", "Perdido", "Cancelled"],
} as const;

export function pipelineVocabularyLabel(record: NamedRecord, field: keyof typeof DEFAULT_VOCABULARY, value: string, t: Translate): string {
  const defaults: readonly string[] = DEFAULT_VOCABULARY[field];
  return record.slug === "pedidos" && defaults.includes(value)
    ? t(defaults[defaults.length - 1]!)
    : value;
}
