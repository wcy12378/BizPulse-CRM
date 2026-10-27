# 运行时架构说明

`workbench.svg`、`architecture.svg` 和 `evaluation.svg` 是仓库内的工程示意图；它们解释代码边界，不替代部署拓扑或生产 SLA。

核心路径：

1. 业务线索进入任务与证据链。
2. Agent 运行产生游标、专家复核和工具提案。
3. CRM 写入受组织权限、字段版本和人工审批约束。
4. 运行结果可回放，并进入评测与材料指纹缓存。

具体路由和源码定位见 [source-evidence](source-evidence.md)。评测数字请以 [metrics-baseline](metrics-baseline.md) 为准；基准百分比不等于本仓库已经完成的实测指标。
