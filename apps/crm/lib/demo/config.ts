import { env } from "@/lib/env";

export const DEMO_EMAIL = env.CRM_DEMO_EMAIL;
export const DEMO_PASSWORD = env.CRM_DEMO_PASSWORD;
export const DEMO_ORG_SLUG = "pi-native-demo";

/**
 * O modo demo é uma conveniência de desenvolvimento, não um bypass de
 * autenticação. Ele só pode acender quando o Supabase também está em loopback
 * e nunca acende em produção, mesmo que alguém deixe a variável esquecida.
 */
export function isDemoModeEnabled(): boolean {
  if (env.CRM_DEMO_MODE !== "true") return false;
  if (env.NODE_ENV === "production" && process.env.CRM_LOCAL_PREVIEW !== "1") return false;
  try {
    const isLoopback = (value: string) => ["localhost", "127.0.0.1", "::1"].includes(
      new URL(value).hostname.toLowerCase().replace(/^\[|\]$/g, ""),
    );
    return isLoopback(env.NEXT_PUBLIC_SUPABASE_URL) && isLoopback(env.NEXT_PUBLIC_APP_URL);
  } catch {
    return false;
  }
}
