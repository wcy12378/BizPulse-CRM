import pg from "pg";

/** Session lock shared by CLI and HTTP seed callers, without schema changes. */
export async function withDemoSeedLock<T>(slug: string, work: () => Promise<T>): Promise<T> {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) throw new Error("演示初始化需要本地 SUPABASE_DB_URL。");
  const url = new URL(connectionString);
  if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname.toLowerCase())) {
    throw new Error("演示初始化只允许连接本地 PostgreSQL。");
  }
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 5000,
    statement_timeout: 5000, application_name: "crm-demo-seed" });
  // pg emits idle connection failures separately from query rejections.
  let connectionError: Error | undefined;
  client.on("error", (error: Error) => { connectionError = error; });
  let locked = false;
  try {
    await client.connect();
    await client.query("SET lock_timeout = '5s'");
    await client.query("SELECT pg_advisory_lock(hashtext('crm-demo-seed'), hashtext($1))", [slug]);
    locked = true;
    const result = await work();
    if (connectionError) throw new Error("演示初始化数据库锁连接已断开，请重试。");
    return result;
  } finally {
    try {
      if (locked && !connectionError) {
        await client.query("SELECT pg_advisory_unlock(hashtext('crm-demo-seed'), hashtext($1))", [slug]);
      }
    } finally {
      await client.end();
    }
  }
}
