# 本地展示与真实 CRM

## 只看展示：无需 Key、Docker、数据库或 node_modules

安装 Node.js 22+，在仓库目录执行：

```sh
node scripts/demo-offline.mjs
```

已安装依赖时也可用 `pnpm demo:offline`。按终端给出的地址打开。这里是虚构数据的交互展示，不能用于证明真实数据库写入、模型调用或外部消息发送。

## 真实 CRM：首次安装

需要 Node.js 22+、pnpm、Docker Desktop（或 Linux Docker Engine）及 Compose v2。Docker 应运行 Linux containers。使用**新的独立 clone**，已有 `.env.local` 会被保护并拒绝覆盖。

```sh
pnpm install --frozen-lockfile
node scripts/demo-setup.mjs --pull
pnpm demo --port=54349
```

`--pull` 下载固定版本的四个 Supabase 镜像；下载完成后不必再加该参数。setup 使用独立 Compose project `bizpulse-showcase-demo`，绑定挂载保存数据库与文件，没有依赖本机 psql、Bash、Supabase CLI 或额外网关镜像。

数据库、配置、日志默认放在 Windows 的 `D:/CRM-local/showcase`（有 D 盘时），否则放在用户目录 `.bizpulse-demo`。设置 `CRM_RUNTIME_DIR` 可以改变位置，setup 和 demo 必须使用相同值。例如 PowerShell：

```powershell
$env:CRM_RUNTIME_DIR = 'D:/CRM-local/showcase'
node scripts/demo-setup.mjs --pull
pnpm demo --port=54349
```

macOS/Linux：

```sh
export CRM_RUNTIME_DIR="$HOME/.bizpulse-demo"
node scripts/demo-setup.mjs --pull
pnpm demo --port=54349
```

setup 生成随机数据库密码、JWT、service role 与管理员密码，仅保存到运行目录 `supabase-demo/compose.env` 和仓库 `.env.local`。不要上传、截图或分享这两个文件。管理员邮箱为 `owner@example.invalid`，密码可在自己的 `.env.local` 中查看 `OWNER_PASSWORD`。虚构 CRM 演示账号由 `pnpm demo` 的幂等 seed 创建；按终端输出的 `/demo/enter?next=/app` 地址进入。

首次流程依次是：启动数据库/Auth/REST/Storage → 等待 Auth 和 Storage 初始化 → 应用 `supabase/baseline.sql` → 创建组织及管理员 → demo 创建虚构数据 → Next 编译并启动。首次编译需要几分钟。没有设置任何付费模型密钥，也没有启动任务 worker、cron 或外部消息集成。

## 后续复用

在同一个 clone、相同 `CRM_RUNTIME_DIR` 中执行：

```sh
node scripts/demo-setup.mjs
pnpm demo --port=54349
```

setup 复用密钥、数据和 baseline 标记，不会自动重放 baseline。demo 在源码未变化时复用编译结果；源码变化后重新构建。真实功能需要的后续数据库迁移应单独审阅并执行，此 quickstart 只负责新实例初始化。

退出 demo 终端使用 Ctrl+C。停止本演示的数据库容器：

```sh
node scripts/demo-setup.mjs --down
```

该命令保留数据，不执行删除卷或重置。Node 网关继续监听本机，供重启容器后复用。网关入口 `127.0.0.1:54340`，数据库端口 54341，Auth/REST/Storage 为 54342–54344，Web 使用 54349。端口固定以避免影响常见的 3000、54321、54322 服务；如端口占用请先停止该端口对应的演示进程。

## 排障与边界

- Docker 未运行：先启动 Docker，重新执行 setup。
- 本地没有镜像：执行带 `--pull` 的 setup；默认启动严格使用 `--pull never`。
- 已有 `.env.local`：使用独立 clone，不要覆盖正在使用的配置。
- baseline 执行中失败：保留运行目录并检查错误；脚本不会假装完成、自动删除数据或覆盖原 CRM。
- 本栈只有 Auth、PostgREST、Storage、数据库，不包含 Realtime；`CRM_REALTIME_ENABLED=false` 使用应用轮询。
- 这是 loopback 本机开发栈，没有 TLS、生产邮件和备份配置，不作为生产部署方案。
- 离线展示与真实 CRM 是不同入口：模型、飞书/WhatsApp 等真实外部集成仍需自行配置和单独验证。
