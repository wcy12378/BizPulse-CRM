import { metadataDaPagina } from "@/lib/i18n/page-metadata";
import { traduzir } from "@/lib/i18n/dicionario";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { roleAtLeast } from "@/lib/auth/types";
import { readHomeDashboard } from "@/lib/home/read-home-dashboard";
import { HomeDashboard } from "./_components/HomeDashboard";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadataDaPagina("首页");
}

export default async function AppHome() {
  const user = await requireAuth();
  const t = (text: string) => traduzir(text, user.idioma);
  const org = await resolveActiveOrg(user);
  if (!org) {
    return (
      <section className="mx-auto max-w-3xl rounded-lg border bg-card p-8">
        <h1 className="text-2xl font-semibold">{t("暂时没有可用的工作区")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("请联系组织管理员确认你的成员权限。")}
        </p>
      </section>
    );
  }

  const result = await readHomeDashboard(org.orgId, roleAtLeast(org.role, "manager"))
    .then((data) => ({ data, failed: false as const }))
    .catch(() => ({ data: null, failed: true as const }));
  if (result.failed) {
    return (
      <section className="mx-auto max-w-3xl rounded-lg border bg-card p-8">
        <p className="text-sm font-medium text-destructive">{t("首页数据暂时无法加载")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("请刷新页面重试；CRM 数据没有被修改。")}
        </p>
      </section>
    );
  }

  const displayName = user.full_name?.trim().split(/\s+/)[0] || t("伙伴");
  return <HomeDashboard data={result.data} displayName={displayName} workspaceName={org.name} />;
}
