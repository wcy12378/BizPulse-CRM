# 来源与个人改造范围

核对日期：2026-10-26。本文说明现有源码与本地改造证据，不能替代可核验的 Git 差异或作者记录。

## 来源与许可

项目继承已有 CRM 源码。`LICENSE` 保留 **Copyright (c) 2026 Rafael Melgaço** 及 MIT 全文；重新展示、品牌调整和独立发布均不改变原版权。

`AGENTS.md`、`CLAUDE.md`、`CHANGELOG.md` 和安装脚本多处引用 [helsome/AiNativeCrm](https://github.com/helsome/AiNativeCrm)。CHANGELOG 包含 v1.41.0（2026-09-20）及更早版本记录。这些是来源线索，不是当前目录对应某个上游提交的证明。

本地 Git 根目录在项目父目录，当前没有提交或 remote。2026-10-26 对上述上游执行只读 `git ls-remote` 返回 `Repository not found`；可能涉及仓库可见性、迁移或访问条件，不能推断原因。已查看项目目录及 `D:/CRM-local/references`、`review-originals` 的有限范围，未找到带可核验提交标识的原始归档。`README.before-showcase.md` 已经包含 Agent 工作台叙述，只能作为展示文档修改前的对照。为本次展示准备创建了私有仓库 `wcy12378/BizPulse-CRM`，尚未推送源码。

**因此，准确上游基线尚未核实；不能把整个工作台或所有 Agent 特性宣称为本轮个人原创，也不能补造“上游初始提交 → feature 提交”的历史。** 如未来发布，首个源码快照应如实说明继承来源和基线限制；新增差异从真实提交开始记录。

## 当前实现与本地改造证据

| 范围 | 当前文件证据 | 可说明的改造及归属边界 |
| --- | --- | --- |
| 商脉品牌 | [品牌说明](../brand/README.md)、`docs/brand/shangmai-logo.svg`、`docs/brand/shangmai-logo-dark.svg`、`docs/brand/og-card.html` | 本地商脉品牌与展示素材已经存在；沿用 CRM 白标机制，不能把白标系统本身说成新增。 |
| 中文、英文界面 | `lib/i18n/traducoes/zh-CN.json`、`en-US.json`、`lib/i18n/idiomas.ts`、`lib/i18n/page-metadata.ts`、`lib/i18n/zh-en.test.tsx` | 中文默认语言及中英文案、metadata 与恢复界面有源码和历史本地验收记录；原有多语言基础属于继承能力。没有准确基线时不声称逐行作者归属。 |
| 真实 CRM 演示 | `app/demo/enter/route.ts`、`lib/demo/config.ts`、`lib/demo/seed.ts`、`seed-lock.ts`、`fixtures.ts` | 隔离虚构组织、种子幂等和锁等待限制有代码；应与真实组织业务隔离。历史实库验收是本地交付证据，不能推导为全新业务引擎。 |
| 离线实验室 | `app/demo/offline/page.tsx`、`lib/demo/offline/machine.ts`、`tests/unit/demo-offline-machine.test.ts` | 演示状态机、版本冲突与故障恢复可说明交互设计和防御；不能作为真实模型或外部工具执行记录。 |
| 本地运行与编译优化 | `scripts/demo.mjs`、`scripts/lib/local-runtime.mjs`、`next.config.ts` | 预编译启动、`CRM_RUNTIME_DIR`、缓存归属检查和本地预览限制有代码；历史耗时/内存为特定机器采样，不能用作普遍性能承诺。 |
| 工作台交互与恢复 | `app/app/ai/workbench/_components/AgentCrmWorkbench.tsx`、`lib/ai/agents/workbench-events.ts`、`workbench-approved-action.ts` | 现有 SSE 回放、请求代次和审批恢复机制可据代码解释；[交付审计](delivery-audit.md)记录本地防御与修复，完整工作台归属仍需基线。 |
| 展示文档与材料 | [源码证据](source-evidence.md)、[指标口径](metrics-baseline.md)、[交付审计](delivery-audit.md)、`docs/assets/showcase/` | 展示叙事、机制图和边界审阅属于本地展示工作；SVG 为设计示意，不能冒充真实产品截图或实测结果。 |

上述表格列出本地改造范围与证据，不表示已经证明所有相关文件由同一人独立编写。文件时间、注释、测试存在及本地日志都不足以代替原始差异。

## Agent 能力展示口径

以下能力在当前树中有实现，可说明系统机制；本轮没有获得足以裁定其个人原创性的来源对比：

| 当前能力 | 代码证据 | 展示边界 |
| --- | --- | --- |
| Pi Runtime、持久运行与回放 | `lib/agent-runtime/pi/`、`lib/ai/agents/workbench-events.ts`、`app/api/v1/ai/workbench/runs/[id]/events/route.ts` | 源码实现与实际运行验收分开说明。 |
| 只读专家协作与字段冲突 | `lib/ai/agents/collaboration.ts`、`workbench-collaboration.ts`、`collaboration-runtime.ts` | 有限字段 hash/revision 校验，不是通用自然语言矛盾检测。 |
| 人工审批与有条件撤销 | `lib/ai/agents/workbench-approved-action.ts`、`mission-direction-fence.ts`、`reversible-lead-update.ts` | claim、独立工具写入、finish 分事务；不是跨外部系统原子回滚。 |
| 知识证据与客户记忆 | `lib/ai/integrations/weknora.ts`、`mem0.ts`、`lib/ai/knowledge/busca.ts` | 外部服务须配置；Mem0 排序不取代本地确认事实。 |
| 确定性评测与语义 Judge | `lib/ai/evals/evaluate-run.ts`、`semantic-judge.ts`、`saved-semantic-review.ts` | 代码、夹具和真实 Judge 记录分开；不把批次用例直接相加或承诺业务转化效果。 |

详细机制与限制见[源码证据](source-evidence.md)。历史验证见[交付审计](delivery-audit.md)；发布候选仍须对最终源码重新核对适用检查。

## 发布边界

源码发布候选应排除真实 `.env`、运行账号、数据库备份、登录会话、缓存目录及目录联接。`evidence/`、测试材料和图片需逐项审阅，不能整目录默认公开。保留许可证、来源说明、公开模板与真正必要的工程证据。

本次只准备审阅材料，没有 commit、push、PR 或 Release。准确上游基线尚未确认，因此提交历史只会记录已核实的本地快照与实际改动，不会伪造上游或个人功能开发历史。完整本地路径清单、工作流触发审阅和秘密模式扫描保存在 `D:/CRM-local/github-showcase/`，不作为公开文档附件。
