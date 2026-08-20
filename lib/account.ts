import { env } from "cloudflare:workers";

export type Account = { userId: string; email: string; fullName: string; organization: string; createdAt: string; updatedAt: string };
type AccountRow = { user_id: string; email: string; full_name: string; organization: string; created_at: string; updated_at: string };

function database() {
  if (!env.DB) throw new Error("RuleWise account storage is unavailable.");
  return env.DB;
}

function mapAccount(row: AccountRow): Account {
  return { userId: row.user_id, email: row.email, fullName: row.full_name, organization: row.organization, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function getAccount(userId: string) {
  const row = await database().prepare("SELECT user_id, email, full_name, organization, created_at, updated_at FROM profiles WHERE user_id = ? LIMIT 1").bind(userId).first<AccountRow>();
  return row ? mapAccount(row) : null;
}

export async function saveAccount(input: { userId: string; email: string; fullName: string; organization: string }) {
  await database().prepare(`INSERT INTO profiles (user_id, email, full_name, organization)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, full_name = excluded.full_name,
    organization = excluded.organization, updated_at = CURRENT_TIMESTAMP`).bind(input.userId, input.email, input.fullName, input.organization).run();
  return getAccount(input.userId);
}
