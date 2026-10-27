# 展示页审阅说明

日期：2026-10-27。

## 本轮产物

- [README](../../README.md)：项目定位、原生 SVG 预览、Mermaid 架构与审批时序、源码映射、评测缓存、指标和启动入口。
- [源码证据](source-evidence.md)：SSE、检索记忆、协作冲突、行锁审批、补偿、指纹与导出边界。
- [指标基准](metrics-baseline.md)：保留六项给定百分比，明确当前证据与待补测方法。
- [工作台](../assets/showcase/workbench.svg)、[评测瀑布图](../assets/showcase/evaluation.svg)、[架构图](../assets/showcase/architecture.svg)：原生 SVG，自包含，无外部图片、字体、脚本或 foreignObject。

## 需要审阅的事实边界

1. 92%／95%／40% 及辅助指标是给定基准，未宣称实测。当前 Golden 10 例，4 real_run、6 synthetic_regression。21 项定向测试通过不等于业务交付率。
2. 两张产品 PNG 是隔离演示组织的真实页面；三张工程 SVG 是设计示意，图中的 Run、客户、Token 与耗时是示例。Tier A 是展示映射，实际分档为 frio/morno/quente；评分不是校准后的成交概率。
3. 三层为逻辑门禁。确定性失败不会保证跳过 Judge；温度由组织配置继承，源码没有固定为 0。
4. 数据库唯一约束包含 profile_revision，共四列。哈希使用原生 JSON.stringify，完整模型参数未全部入键。
5. claim、CRM 工具调用、finish 分属不同提交边界；补偿是带版本条件的业务更新。评测报告与 Outbox 也分开持久化。
6. 本轮本地启动数据库、Auth、REST、Storage 和前端。真实模型、WhatsApp、WeKnora、Mem0、Langfuse、Realtime 与后台任务尚未完成集成验收。

## 验证范围

SVG 已使用无头浏览器渲染并目视检查，XML、必需字段、字体下限、文字重叠和外部资源检查通过。Markdown 相对链接经过存在性检查。定向评测测试的命令及结果见[指标基准](metrics-baseline.md)。当前本地预编译完整构建、真实账号双语路线、核心 CRUD/拒绝/并发、页面压力及重启复用已通过，详情见[交付审计](delivery-audit.md)。未宣称全库测试或外部服务验收通过。

Next.js 开发默认记录 Server Function 参数，可能包含登录密码；本轮在 next.config.ts 关闭 serverFunctions 参数日志，本地管理员密码已轮换。实际密码、密钥、浏览器登录证据和运行目录仅保存在本地，不放入这些展示文档。

本轮未 commit、push 或创建 PR。待用户审阅后再提交 GitHub，保留原 MIT 许可与版权声明。
