import { NextResponse } from "next/server";

import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoModeEnabled } from "@/lib/demo/config";
import { ensureDemoData } from "@/lib/demo/seed";
import { cookies } from "next/headers";
import { cookieSecure } from "@/lib/supabase/cookie-secure";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"), "/app/kanban");
  if (!isDemoModeEnabled()) return NextResponse.redirect(new URL("/login", url));

  try {
    const demo = await ensureDemoData();
    const supabase = await createClient();
    const { data: current } = await supabase.auth.getUser();
    if ((current.user?.email ?? "").toLowerCase() !== DEMO_EMAIL.toLowerCase()) {
      const { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      if (error) throw new Error("demo_sign_in_failed");
    }
    const store = await cookies();
    store.set("active_org", demo.orgId, { httpOnly: true, sameSite: "strict", secure: cookieSecure(), path: "/" });
    const response = NextResponse.redirect(new URL(next, url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    // A failed database seed must still leave a usable, explicitly offline route.
    return NextResponse.redirect(new URL("/demo/offline?setup=unavailable", url));
  }
}
