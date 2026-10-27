import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureBuiltinAgents } from "@/lib/ai/agents/ensure-builtins";
import { ensureStoppedDemoChannelSession } from "@/lib/channels/demo-session";
import { DEMO_EMAIL, DEMO_ORG_SLUG, DEMO_PASSWORD, isDemoModeEnabled } from "./config";
import { B2B_FIXTURES, DEMO_PIPELINE, DEMO_STAGES } from "./fixtures";
import { withDemoSeedLock } from "./seed-lock";

type Admin = ReturnType<typeof createAdminClient>;
type FixtureTable = "contacts" | "crm_leads" | "crm_tasks";

/** Stable identity is independent of editable titles, email addresses and stages. */
export function demoFixtureId(orgId: string, key: string): string {
  const hex = createHash("sha256").update(`crm-b2b-demo-v1:${orgId}:${key}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function ensureUser(admin: Admin): Promise<string> {
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("无法读取演示账号。");
    const existing = data.users.find((user) => user.email?.toLowerCase() === DEMO_EMAIL.toLowerCase());
    if (existing) {
      if (existing.user_metadata?.demo !== true) throw new Error("演示邮箱已被非演示账号占用，已停止初始化。");
      return existing.id; // Never reset an existing user's password or metadata.
    }
    if (data.users.length < 200) break;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true,
    user_metadata: { full_name: "演示账号", locale: "zh-CN", demo: true },
  });
  if (error || !data.user) throw new Error("无法创建演示账号。");
  return data.user.id;
}

async function ensureOrganization(admin: Admin, userId: string) {
  const { data: existing, error } = await admin.from("organizations").select("id, created_by")
    .eq("slug", DEMO_ORG_SLUG).maybeSingle();
  if (error) throw new Error("无法读取演示工作区。");
  if (existing && existing.created_by !== userId) throw new Error("演示工作区不属于演示账号，已停止初始化。");
  let orgId = existing?.id;
  const fresh = !orgId;
  if (!orgId) {
    const { data, error: insertError } = await admin.from("organizations").insert({
      slug: DEMO_ORG_SLUG, legal_name: "Fictional B2B Demo", display_name: "跨境 B2B 演示（虚构）",
      locale: "zh-CN", timezone: "Asia/Shanghai", onboarded_at: new Date().toISOString(), created_by: userId,
    } as never).select("id").single();
    if (insertError || !data) throw new Error("无法创建演示工作区。");
    orgId = data.id;
  }
  const { data: membership, error: readError } = await admin.from("user_organizations").select("id, revoked_at")
    .eq("organization_id", orgId).eq("user_id", userId).maybeSingle();
  if (readError) throw new Error("无法读取演示成员关系。");
  if (membership?.revoked_at) throw new Error("演示成员已被撤销，请由管理员恢复后重试。");
  if (!membership) {
    const { error: insertError } = await admin.from("user_organizations").insert({
      organization_id: orgId, user_id: userId, role: "admin", accepted_at: new Date().toISOString(),
    } as never);
    if (insertError) throw new Error("无法绑定演示账号。");
  }
  return { orgId, fresh };
}

async function ensurePipeline(admin: Admin, orgId: string, fresh: boolean): Promise<string> {
  const { data: existing, error } = await admin.from("crm_pipelines").select("id")
    .eq("organization_id", orgId).eq("slug", DEMO_PIPELINE.slug).maybeSingle();
  if (error) throw new Error("无法读取 B2B 演示漏斗。");
  let pipelineId = existing?.id;
  // Only a newly created organization may replace the trigger's untouched default board.
  // Existing demo boards (and any user-edited stages/deals) remain untouched.
  if (!pipelineId && fresh) {
    const { data: defaults, error: defaultError } = await admin.from("crm_pipelines").select("id")
      .eq("organization_id", orgId).eq("is_default", true).maybeSingle();
    if (defaultError) throw new Error("无法读取初始默认漏斗。");
    if (defaults) {
      const { data: applied, error: applyError } = await admin.rpc("fn_aplicar_quadro_do_onboarding", {
        p_organization_id: orgId, p_pipeline_id: defaults.id, p_nome: DEMO_PIPELINE.name,
        p_slug: DEMO_PIPELINE.slug, p_etapas: [],
      } as never);
      if (applyError || !(applied as { ok?: boolean } | null)?.ok) throw new Error("无法安全替换初始演示漏斗。");
      pipelineId = defaults.id;
    }
  }
  if (!pipelineId) {
    const { data: defaults, error: defaultError } = await admin.from("crm_pipelines").select("id")
      .eq("organization_id", orgId).eq("is_default", true).maybeSingle();
    if (defaultError) throw new Error("无法读取默认漏斗。");
    const { data, error: insertError } = await admin.from("crm_pipelines").insert({
      organization_id: orgId, ...DEMO_PIPELINE, description: "Fictional demo / 虚构跨境 B2B 演示",
      is_default: !defaults,
    } as never).select("id").single();
    if (insertError || !data) throw new Error("无法创建 B2B 演示漏斗。");
    pipelineId = data.id;
  }
  return pipelineId;
}

async function insertMissing(admin: Admin, table: FixtureTable, orgId: string, key: string, payload: Record<string, unknown>) {
  const id = demoFixtureId(orgId, key);
  const { data, error } = await admin.from(table).select("id").eq("organization_id", orgId).eq("id", id).maybeSingle();
  if (error) throw new Error(`无法读取演示资料：${table}`);
  if (!data) {
    const { error: insertError } = await admin.from(table).insert({ ...payload, id, organization_id: orgId } as never);
    if (insertError) throw new Error(`无法创建演示资料：${table}`, { cause: { code: insertError.code } });
  }
  return id;
}

async function ensureBoard(admin: Admin, orgId: string, userId: string, fresh: boolean) {
  const pipelineId = await ensurePipeline(admin, orgId, fresh);
  const stageIds: Record<string, string> = {};
  for (const stage of DEMO_STAGES) {
    const id = demoFixtureId(orgId, `stage:${stage.slug}`);
    const { data: existing, error } = await admin.from("crm_stages").select("id")
      .eq("organization_id", orgId).eq("pipeline_id", pipelineId).eq("id", id).maybeSingle();
    if (error) throw new Error("无法读取演示阶段。");
    if (existing) { stageIds[stage.slug] = existing.id; continue; }
    const { data, error: insertError } = await admin.from("crm_stages").insert({
      id, organization_id: orgId, pipeline_id: pipelineId, ...stage,
      description: "Fictional demo stage / 虚构演示阶段", is_won: stage.slug === "won", is_lost: stage.slug === "lost",
    } as never).select("id").single();
    if (insertError || !data) throw new Error("无法创建演示阶段。");
    stageIds[stage.slug] = data.id;
  }
  const now = Date.now();
  const firstContactIds: string[] = [];
  for (const fixture of B2B_FIXTURES) {
    const marker = { demo: true, fixture_version: 1, fixture_key: fixture.key, fictional: true };
    const contactId = await insertMissing(admin, "contacts", orgId, `contact:${fixture.key}`, {
      name: fixture.name, display_name: `${fixture.name} · ${fixture.company}`,
      email: `${fixture.key}@example.invalid`, source: "demo", tags: ["demo", "虚构演示", "跨境B2B"],
      source_metadata: marker, custom_fields: { company: fixture.company, market: fixture.market, fictional: true },
      created_by_user_id: userId,
    });
    firstContactIds.push(contactId);
    const closed = fixture.stage === "won" || fixture.stage === "lost";
    const leadId = await insertMissing(admin, "crm_leads", orgId, `lead:${fixture.key}`, {
      pipeline_id: pipelineId, stage_id: stageIds[fixture.stage], contact_id: contactId,
      title: `${fixture.company} — ${fixture.product}`,
      description: `【虚构演示】询盘：${fixture.product}，${fixture.quantity}件；报价 USD ${fixture.unitPrice.toFixed(2)}/件，${fixture.terms}；确认样品及预付款后${fixture.leadDays}天出货；30%预付款、70%出货前付清。报价有效期14天，运费/税费另计，非真实报价。`,
      value_cents: Math.round(fixture.quantity * fixture.unitPrice * 100), currency: "USD",
      status: closed ? fixture.stage : "open", source: "demo", source_metadata: marker,
      external_id: `demo-b2b-v1:${fixture.key}`, tags: ["demo", "虚构演示", fixture.market], owner_user_id: userId,
      ...(closed ? { closed_at: new Date(now - 86400000).toISOString() } : {}),
      ...(fixture.stage === "lost" ? { lost_reason: "price" } : {}),
    });
    await insertMissing(admin, "crm_tasks", orgId, `task:${fixture.key}`, {
      title: fixture.task, description: "【虚构演示 / source=demo】仅用于本地跟进练习；不会向任何买家发送消息。",
      due_date: new Date(now + fixture.dueHours * 3600000).toISOString(), priority: fixture.priority,
      status: fixture.taskStatus, contact_id: contactId, lead_id: leadId, assigned_to: userId, created_by: userId,
    });
  }
  const channelSessionId = await ensureStoppedDemoChannelSession(admin, orgId, userId);
  const { data: conversation, error: conversationError } = await admin.from("conversations").select("id")
    .eq("organization_id", orgId).eq("contact_id", firstContactIds[0]).eq("channel_session_id", channelSessionId).maybeSingle();
  if (conversationError) throw new Error("无法读取演示会话。");
  if (!conversation) {
    const date = new Date(now).toISOString();
    const { error } = await admin.from("conversations").insert({
      organization_id: orgId, contact_id: firstContactIds[0], channel_session_id: channelSessionId,
      channel: "whatsapp", status: "open", assigned_to_user_id: userId, assigned_at: date,
      last_inbound_at: date, last_message_at: date, unread_count_for_assignee: 1,
      last_message_preview: "【虚构演示】请确认3000件保温杯的FOB报价与35天交期，需要人工核实。",
      metadata: { demo: true, fictional: true, no_external_channel: true },
    } as never);
    if (error) throw new Error("无法创建演示会话。");
  }
  return pipelineId;
}

/** Local-only, cross-process serialized, append-only fixture provisioning. */
export async function ensureDemoData(): Promise<{ userId: string; orgId: string; pipelineId: string }> {
  if (!isDemoModeEnabled()) throw new Error("演示初始化仅限显式启用的本地演示模式。");
  return withDemoSeedLock(DEMO_ORG_SLUG, async () => {
    const admin = createAdminClient();
    const userId = await ensureUser(admin);
    const { orgId, fresh } = await ensureOrganization(admin, userId);
    const pipelineId = await ensureBoard(admin, orgId, userId, fresh);
    await ensureBuiltinAgents(orgId);
    return { userId, orgId, pipelineId };
  });
}



