/** Presentation labels only: persisted IANA zones and field type values stay unchanged. */
const ROTULOS_DE_FUSO: Record<string, string> = {
  "Asia/Shanghai": "Xangai (UTC+08:00)",
  "Asia/Hong_Kong": "Hong Kong (UTC+08:00)",
  "Asia/Singapore": "Singapura (UTC+08:00)",
  "Asia/Tokyo": "Tóquio (UTC+09:00)",
  "Africa/Luanda": "Luanda (UTC+01:00)",
  "America/Sao_Paulo": "São Paulo (UTC-03:00)",
  "America/Manaus": "Manaus (UTC-04:00)",
  "America/Belem": "Belém (UTC-03:00)",
  "America/Recife": "Recife (UTC-03:00)",
  "America/Fortaleza": "Fortaleza (UTC-03:00)",
  "Europe/Lisbon": "Lisboa (Europa)",
  UTC: "Tempo Universal Coordenado (UTC)",
};

export function opcoesDeFusoHorario(atual: string): string[] {
  const zonas = Object.keys(ROTULOS_DE_FUSO);
  // Existing valid zones outside the suggested list remain selectable and visible.
  return atual && !zonas.includes(atual) ? [...zonas, atual] : zonas;
}

export function rotuloDoFusoHorario(zona: string): string {
  return ROTULOS_DE_FUSO[zona] ?? zona;
}

export const ROTULOS_DE_TIPO_DE_CAMPO: Record<string, string> = {
  text: "Texto",
  textarea: "Texto longo",
  number: "Número",
  date: "Data",
  boolean: "Sim ou não",
  select: "Seleção única",
  multiselect: "Seleção múltipla",
  email: "Email",
  phone: "Telefone",
  url: "URL",
};
