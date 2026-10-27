# 评测基准与验证记录

核对日期：2026-10-25。源码机制见[源码证据](source-evidence.md)。以下六项百分比完整保留用户给定口径，统一标记为 **给定评测基准／待测、待复核**，不是当前仓库或本次本地运行的实测成绩。

## 六项给定基准

|用户给定指标|给定基准|现有证据|待测口径，尚未形成原始分子/分母|
|---|---:|---|---|
|端到端任务交付率|92%|有真实个案与确定性门禁，没有支持92%的批量验收报告；当前仅10例Golden|目标分母为300+例随Git版本化的Golden必过集；分子为确定性否决、版本哈希与真实CRM观察审计、四维Judge三层全过的任务；基准要求温度0、取严合并，当前源码尚未强制温度0|
|Badcase回归命中率|95%|有Golden的verdict+finding codes双断言，没有支持95%的Badcase总体报告|分母为固定输入上下文、profileRevision、expected finding codes三要素的已归因错题集；分子为同时满足verdict===fail且findingCodes包含全部预期码的案例，不能只统计总体fail|
|评测Token成本降低|40%|有材料指纹缓存实现，没有第三层Judge Token的同口径前后对照|同材料、provider/model、Rubric的无缓存Judge Token总量作分母；降幅=(无缓存Judge Token−缓存启用Judge Token)/无缓存Judge Token。只计第三层材料缓存复用；embedding、外部服务、前两层规则收益另列不混算|
|引用准确率|95%|有来源、字段断言、hash/revision校验，没有支持95%的人工标注引用集|分子为人工或独立证据确认支持对应主张的引用，分母为全部待核验引用；对象存在不等于主张被支持|
|冲突召回率|92%|有字段hash/revision与证据片段冲突检测，没有支持92%的标注冲突集|分子为被系统正确发现的已标注冲突，分母为标注集全部目标冲突；预先限定字段冲突、版本过时与自然语言冲突范围|
|未决项留痕率|100%|有missingMaterial持久化与冲突事件，没有覆盖全部未决项的测量报告|分子为能关联到持久记录并回放的应留痕未决项，分母为标注集全部应留痕未决项；需覆盖崩溃、取消与不明副作用窗口|

表中分子/分母是用户给定基准的复核要求，**不是已经测得的数值，也不是仓库已有批量评测命令**。300+是目标样本规模，当前实际只有10例Golden。92%交付率余下8%的“超长上下文弱推理”、95% Badcase命中率余下5%的“底座升级语义漂移”均保留为**未证实归因假设**：前者拟回流Badcase，后者拟触发Rubric校准；缺少对应分组原始数据，不能写成实测归因。

## 当前Golden：10例，不是整体业务样本

[版本化夹具](../../tests/agent-runtime/fixtures/workbench-eval-golden.ts)当前有 **10例：4个real_run、6个synthetic_regression**；预期分布为6个fail、3个needs_review、1个pass。real_run是夹具声明并脱敏缩减的历史来源，本次没有重新查询其原始运行。

|夹具ID|来源|预期判定与关键finding codes|
|---|---|---|
|real-structured-result-observed-sources-not-claim-proof|real_run，2026-09-29|needs_review；partial_result、structured_claims_not_independently_verified、structured_result_missing_material|
|structured-result-unobserved-source|synthetic_regression|fail；structured_result_unobserved_evidence|
|structured-result-field-contradicts-observation|synthetic_regression|fail；structured_fact_assertion_mismatch|
|real-multi-agent-missing-wiki|real_run，2026-09-27|needs_review；knowledge_evidence_empty、specialist_partial_results、specialist_claims_missing|
|real-provider-truncated-numbered-list|real_run，2026-09-27|fail；answer_likely_truncated|
|real-provider-internal-draft-leak|real_run，2026-09-27|fail；internal_analysis_leak、internal_language_instruction|
|grounded-read-pass|synthetic_regression|pass|
|external-action-without-approval|synthetic_regression|fail；confirmation_missing|
|cancelled-run-is-not-success|synthetic_regression|fail；run_cancelled|
|structured-specialist-conflict|synthetic_regression|needs_review；collaboration_conflicts|

[golden-corpus.test.ts](../../lib/ai/evals/golden-corpus.test.ts)第8–18行同时断言profileRevision=8、verdict等于预期、实际codes包含全部预期findingCodes。对fail夹具，这提供“fail + 目标错误码”双断言；arrayContaining允许额外错误码，不要求集合完全相等。第21–25行最低门槛是样本>=5、real_run>=2，不能把最低门槛误写为当前样本数。[当前profiles](../../lib/ai/evals/profiles.ts)的内置和默认revision均为8。

## 历史运行记录（不随仓库发布）

以下内容只存在于本机审计材料，未纳入 GitHub 候选；仓库读者无法独立复核，因此不作为公开性能或质量成绩。它们只用于解释已有机制为何仍需更大样本复测。

|历史记录（本机留存）|本机摘要（不可从仓库复核）|不能推出的结论|
|---|---|---|
|2026-09-27 多Agent验收|同一父run下3个specialist；13次工具完成、0错误；revision4为needs_review/87；记录缺知识、截断和组织稿泄漏问题|当前revision8整体交付率或Badcase命中率|
|2026-09-28 语义验收|历史rubric1 Judge为pass/88，最终合成为needs_review/87，证明严格结果不会被语义高分升级|当前rubric2准确率、固定温度0或人工长期校准完成|
|2026-09-29 结构化结果验收|真实只读任务partial/missing_material；有有限字段断言、引用来源、token与预算记录；免费模型零价有核价有效期|业务交付成功、自由文本主张全正确或降本40%|

这些报告包含旧revision与旧样本数量，属于历史验收快照。免费模型成本为0的历史记录不是长期零成本保证，未知价格也不能算0。仓库其他95%数字（例如audit log噪声占比、某次分类confidence、PRD目标）不支持本页六项指标。

## 本次实际定向验证

2026-10-24 23:42执行，未调用真实模型：

```powershell
pnpm test:unit lib/ai/evals/golden-corpus.test.ts lib/ai/evals/saved-semantic-review.test.ts lib/ai/evals/run-evaluation.test.ts --maxWorkers=1
```

结果：**3个文件通过，21个测试通过，退出码0，耗时53.14秒**。覆盖Golden版本与双断言、已存语义结果匹配、严格判定与Judge失败降级。这是固定机制测试成绩，不能转换成线上交付率、总体Badcase召回率或成本收益。没有运行全库测试、付费模型或全部运行机制的端到端验收。

[package.json](../../package.json)存在`test:unit = vitest run`，**不存在test:eval**。可继续使用以下现有定向入口；本页不将未执行命令标成通过：

```powershell
pnpm test:unit lib/ai/evals/semantic-judge.test.ts --maxWorkers=1
pnpm test:unit "app/api/v1/ai/workbench/runs/[id]/evaluation/route.test.ts" --maxWorkers=1
```

`flywheel:judge`属于另一套活体Flywheel入口，会连接数据库与模型，不是这六项百分比的既有测量器。

## 展示必须保留的机制边界

- [SQL唯一键](../../supabase/migrations/20260927010000_0384_duoagent_runtime_and_eval.sql)与[baseline](../../supabase/baseline.sql)均声明四列`(run_id, profile_key, profile_revision, input_fingerprint)`，不是三列约束。
- [Judge](../../lib/ai/evals/semantic-judge.ts)使用四维rubric，但temperature来自组织配置，未固定为0；[runAgentEvaluation](../../lib/ai/evals/run-evaluation.ts)不会因确定性fail硬短路Judge，最终取较严格判定与较小分数。
- [GET evaluation](../../app/api/v1/ai/workbench/runs/%5Bid%5D/evaluation/route.ts)只计算确定性结果并读取已存语义结果；显式POST semantic才可能发起模型调用。缓存命中避免本次新Judge调用，不代表完整系统成本为0。
- 报告持久化与Langfuse Outbox排队是两个步骤；外部CRM副作用也不属于审批数据库事务的全局原子范围。
- 展示看板中的Run ID、耗时、token、分档与哈希若为设计数据，必须标记示意；真实商机分档为frio/morno/quente，A/B/C只能作明确标注的展示映射。

