export function realtimeEnabled(config: { override?: string; localPreview?: string; localDev?: string; supabaseUrl: string }): boolean {
  if (config.override === "true") return true;
  if (config.override === "false") return false;
  try {
    const local = ["localhost", "127.0.0.1", "::1"].includes(new URL(config.supabaseUrl).hostname.replace(/^\[|\]$/g, ""));
    return !(local && (config.localPreview === "1" || config.localDev === "1"));
  } catch { return true; }
}
