# 展示页源码证据

核对日期：2026-10-25。本文区分源码机制、历史运行记录与本次定向测试；源码存在不代表所有服务已在本机部署，也不代表业务效果已测量。指标口径见[评测基准](metrics-baseline.md)。

## 运行链路与边界

|能力|已确认机制|源码入口与核对位置|
|---|---|---|
|SSE回放|按组织、run与sequence游标轮询数据库；每批100条，约25秒连接，支持Last-Event-ID及after；不是数据库主动推送|[events GET](../../app/api/v1/ai/workbench/runs/%5Bid%5D/events/route.ts)，12–50行|
|事件序号与脱敏|读取最大sequence后插入，23505竞争最多重试四次；按事件字段白名单和敏感键名脱敏，不保证识别任意正文中的全部PII|[appendWorkbenchEvent / redactEventPayload](../../lib/ai/agents/workbench-events.ts)，36–147行|
|前端合并|按cursor去重、run ID隔离，历史详情使用请求代数；不是全局统一幂等reducer|[streamRunEvents / openHistory](../../app/app/ai/workbench/_components/AgentCrmWorkbench.tsx)，449–495、712–725行|
|公司知识|WeKnora按发布来源与绑定KB授权，回读page/document并核对版本；本地pgvector读取实际命中chunk版本|[searchCompanyWiki / readCompanyWikiEvidence](../../lib/ai/integrations/weknora.ts)，123–247行；[buscarConhecimento](../../lib/ai/knowledge/busca.ts)，64–109行；[crmSearchKnowledge](../../lib/mcp/tools/evolucao.ts)，89–145行|
|客户记忆|本地确认事实为权威，Mem0仅投影与排序；校验ownership/hash并重读本地行；partial不等于全部已读|[saveCustomerMemory / readConfirmedCustomerMemory](../../lib/ai/integrations/mem0.ts)，60、191、312、422行|
|商机评分|CRM信号公式、0–100范围及reason/evidence；真实分档frio/morno/quente；不是成交概率保证|[calculaScore](../../lib/leads/score-formula.ts)，123–209行；[score writer](../../lib/leads/score-writer.ts)，60–124行|
|迟滞|初次阈值40/70；已有档升级45/75、降级35/65；阈值为产品约定|[resolveBand](../../lib/kanban/score-band.ts)，30–39、104–119行|

向量检索可能调用embedding provider；WeKnora、Mem0与模型服务须分别配置，不能从接口存在推导“全部本地推理”或“零API成本”。

## 只读协作、冲突与审批

|能力|已确认机制与适用范围|源码入口|
|---|---|---|
|主管与specialist|客户事实、商机诊断、政策顾问，各自只读工具白名单；独立复核最多并行3，Mission为共享预算改为串行1|[OPPORTUNITY_REVIEW_PLAN / collaborationPlanForMission](../../lib/ai/agents/collaboration.ts)，108–149行|
|持久子运行|child run、租约、execution_attempt_id条件结算；claims/evidence/missingMaterial存runtime_state.specialistResult|[workbench collaboration](../../lib/ai/agents/workbench-collaboration.ts)，121–209、444、504–537行|
|字段冲突|同对象字段的value hash/revision、同版本同证据片段差异；有限标量字段与数组，不是通用自然语言矛盾检测|[evidence claims](../../lib/ai/agents/evidence-claims.ts)，45–70、130–174行；[detectCollaborationConflicts](../../lib/ai/agents/collaboration-runtime.ts)，57–157、324–329行|
|审批claim|事务中锁root run、proposal，检查状态后更新审批与事件并提交|[claimWorkbenchApprovedAction](../../lib/ai/agents/workbench-approved-action.ts)，12–103行|
|审批结算|工具调用完成后，另一事务共同提交提案结果、补偿材料、私有消息、事件与resume job|[finishWorkbenchApprovedAction](../../lib/ai/agents/workbench-approved-action.ts)，104–217行；[decision route](../../app/api/v1/ai/workbench/runs/%5Bid%5D/proposals/%5BproposalId%5D/decision/route.ts)，322–368行|
|外部结果未明|记录reconciliation_required / effect_may_have_completed，run进入partial；不直接重放副作用|[markWorkbenchApprovedActionUncertain](../../lib/ai/agents/workbench-approved-action.ts)，221–274行|
|方向与补偿|advisory lock和direction revision约束旧方向写入；部分lead字段用expected_updated_at条件补偿|[withMissionDirectionWriteFence](../../lib/ai/agents/mission-direction-fence.ts)，20–75行；[reversible lead update](../../lib/ai/agents/reversible-lead-update.ts)，3–70行；[undo route](../../app/api/v1/ai/workbench/runs/%5Bid%5D/proposals/%5BproposalId%5D/undo/route.ts)，19–76行|

事务顺序是 **claim事务提交 → CRM工具独立写入 → finish事务提交**。方向fence事务回滚不会自动撤销已提交的工具写入；人工undo是有条件业务补偿，不能画成跨外部系统的SQL ROLLBACK。消息发送另有[draft与receipt恢复](../../lib/ai/agents/workbench-send-decision-recovery.ts)链路。未决材料落实于specialistResult.missingMaterial及冲突事件；没有凭空引入unresolved_items表。

## 评测门禁与语义Judge

[ evaluateAgentRun ](../../lib/ai/evals/evaluate-run.ts)（439–500行）是无模型、数据库与网络依赖的纯确定性评测，含任务完成、答案质量、知识证据、工具可靠性、策略合规、效率、协作七维。[profiles](../../lib/ai/evals/profiles.ts)将前五维标为required；`requiredFailed`（481–483行）检查必需维度fail，最终判定优先级是未完成/未运行→not_run，其次required fail→fail，再needs_review，否则pass。加权分数不能覆盖必需项失败。

[LlmAgentSemanticJudge](../../lib/ai/evals/semantic-judge.ts)使用rubric revision 2，四维为task_fit、factual_support、missing_material_honesty、actionability，各0–4分。优先通过内存工具submit_semantic_evaluation提交，兼容JSON fallback；总score直接取模型提交字段，代码没有把四项求和归一化。schema限制数组长度4，key唯一性主要依靠提示词约束。

**温度没有固定为0。** Judge未显式传temperature；[runModelCall](../../lib/agent-engine/edge/llm/run-model-call.ts)（623–629、727–734行）读取组织llm.params并转发，[Pi model adapter](../../lib/agent-runtime/pi/model-adapter.ts)（155–162行）按binding传递。[evaluation runtime](../../lib/agent-runtime/pi/ai-sdk-compat.ts)（266–277行）限制非read工具，不修改温度。

[runAgentEvaluation / stricterVerdict](../../lib/ai/evals/run-evaluation.ts)（10–18、30–74行）用fail > needs_review > pass > not_run合成判定，分数取较小值；Judge失败将确定性pass降为needs_review。**确定性fail没有阻止Judge调用的硬短路**，只有没有judge或not_run会提前返回。因此展示中的“三层门禁”是逻辑分层，不能描述为三个顺序早退阶段。

## 两级SHA-256、读取与显式评测

[evaluation route](../../app/api/v1/ai/workbench/runs/%5Bid%5D/evaluation/route.ts)的loadEvaluationMaterial（59–258行）构建第一层：

```text
baseFingerprint = SHA256(JSON.stringify({
  run: { id, task, status, updatedAt, finalText, resultDocument },
  events: aggregateEvents,
  proposals,
  collaborationRuns,
  runtimeMessages,
  confirmedMemoryExpectations,
  profile: { key, revision }
}))
```

这是原生JSON.stringify，未做canonical JSON排序；第一层没有额外namespace。proposals保留查询结果的id/tool_name/status；collaborationRuns保留id/specialist_key/status/error_code/runtime_state；runtimeMessages汇总根与子持久化消息。父事件按sequence，子事件按created_at后分配汇总sequence；proposals未显式排序。

第二层evaluationFingerprint（261–263行）：

```text
SHA256(`${baseFingerprint}:${evaluator}`)
evaluator = deterministic
          | semantic:v2:<provider>:<model>
          | semantic:v2:<provider>:<model>:failed:<randomUUID>
```

失败结果另存随机namespace，不污染已完成缓存；credentialId、temperature等完整模型参数未单独入key，不能宣称任意参数变化都自动失效。

|入口|实际行为|
|---|---|
|GET（300–325行）|manager权限、同组织材料；重算确定性报告；只读最近20条同profile/revision报告；无模型、持久化、Outbox调用；已保存语义结果作为独立savedSemanticEvaluation字段返回|
|POST默认semantic（328–429行）|要求可读取的发布版本模型binding；completed精确缓存命中则cached:true，未命中才调用Judge，120秒超时；结果持久化后按配置投影|
|POST mode=deterministic_export（346–357行）|无Judge；显式保存确定性报告、请求Langfuse投影并审计|

[matchingSavedSemanticReview](../../lib/ai/evals/saved-semantic-review.ts)（4–20行）核对run/profile/revision/completed/rubric与judgeId前缀`workbench_semantic_v2:`，重建`semantic:v2:<provider>:<model>`并校验哈希。

persistReport（265–287行）与[迁移0384](../../supabase/migrations/20260927010000_0384_duoagent_runtime_and_eval.sql)（104–105行）、[baseline](../../supabase/baseline.sql)（36514行）一致：

```sql
unique (run_id, profile_key, profile_revision, input_fingerprint)
```

upsert使用同四列onConflict、ignoreDuplicates:true。这里证明的是迁移与baseline声明；当前部署库可另用pg_constraint核查。

## Langfuse Outbox与证据强度

实际链路：POST保存报告 → [projectLangfuseEvaluation](../../lib/ai/integrations/langfuse.ts)（301–345行）复制各维度/overall/semantic数值 → enqueue稳定event ID写event_log（140–160行）→ [integration drain cron](../../app/api/v1/cron/ai-integration-drain/route.ts)（25–30行）→ [注册handler](../../lib/event-log/register-handlers.ts)（58行）→ langfuseExportHandler/exportLangfuseEvent → HTTP ingestion与回执检查（348–425行）。导出器不会再跑额外Judge。[通用drain](../../lib/event-log/drain.ts)负责退避与最多5次错误尝试。

**报告保存与Outbox排队是两步，非同一事务。** deterministic_export排队失败返回503；semantic及cache分支吞投影异常后仍可返回报告。缓存命中不执行本次新Judge，但接口未提供本次tokens=0的计量字段。

当前Golden、历史真实运行与本次21个定向测试的具体范围见[评测基准与验证记录](metrics-baseline.md)。
