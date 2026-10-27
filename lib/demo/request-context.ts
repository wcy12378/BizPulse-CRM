import { cache } from "react";
import { headers } from "next/headers";
import { isDemoModeEnabled } from "./config";

/** A readonly, local-only demonstration must not depend on live branding/auth reads. */
export const isOfflineDemoRequest = cache(async () =>
  isDemoModeEnabled() && (await headers()).get("x-pathname") === "/demo/offline",
);
