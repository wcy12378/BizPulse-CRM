import { notFound } from "next/navigation";
import { isDemoModeEnabled } from "@/lib/demo/config";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import { OfflineWorkbench } from "@/components/demo/OfflineWorkbench";

export const dynamic = "force-dynamic";
export default async function OfflineDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  if (!isDemoModeEnabled()) notFound();
  const query = await searchParams;
  const locale = await idiomaDoVisitante(
    query.locale === "en-US" || query.locale === "zh-CN" ? query.locale : undefined,
  );
  return (
    <IdiomaProvider locale={locale}>
      <OfflineWorkbench />
    </IdiomaProvider>
  );
}
