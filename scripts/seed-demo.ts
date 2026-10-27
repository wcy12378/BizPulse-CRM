import { ensureDemoData } from "../lib/demo/seed";

async function main(): Promise<void> {
  const result = await ensureDemoData();
  process.stdout.write(`虚构 B2B 演示数据已准备。组织：${result.orgId}；漏斗：${result.pipelineId}\n`);
}

main().catch(() => {
  // Never print raw auth/connection exceptions: they can contain credentials.
  process.stderr.write("演示初始化失败，请检查本地演示门禁、数据库连接与迁移状态后重试。\n");
  process.exitCode = 1;
});
