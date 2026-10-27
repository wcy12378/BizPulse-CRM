"use client";

import { useWatch, type Control, type FieldValues, type Path } from "react-hook-form";

import { parseReaisToCents, formatCents } from "@/lib/money";
import { useTagDeIdioma } from "@/hooks/i18n/useLocaleDeData";

/**
 * Mostra, embaixo do campo, como o valor digitado foi entendido.
 *
 * Dinheiro nunca deve ser interpretado em silêncio: era assim que "249.90"
 * virava R$ 24.990,00 e só aparecia no relatório, dias depois. Com o eco, quem
 * digita vê o número que vai ser gravado antes de salvar.
 *
 * Usa `useWatch` (e não `form.watch()` dentro do render) porque o segundo
 * devolve uma função que o React Compiler não consegue memoizar, e ele então
 * desiste de otimizar o formulário inteiro.
 */
export function EcoDoValor<T extends FieldValues>({ control, currency = "BRL" }: { control: Control<T>; currency?: string | null }) {
  const locale = useTagDeIdioma();
  const digitado = useWatch({ control, name: "valueReais" as Path<T> }) as unknown as
    | string
    | undefined;
  const centavos = parseReaisToCents(digitado ?? "");
  if (centavos === null) return null;
  const amount = currency === null
    ? new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(centavos / 100)
    : formatCents(centavos, currency);
  return <p className="text-xs text-muted-foreground">= {amount}</p>;
}
