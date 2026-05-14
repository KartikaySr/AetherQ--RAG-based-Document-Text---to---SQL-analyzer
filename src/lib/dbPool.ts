import { Pool } from "pg";

const globalForPool = globalThis as unknown as { __aetherqPg?: Pool };

export function getAnalyticsDbPool(): Pool | null {
  const conn = process.env.DATABASE_URL;
  if (!conn) return null;

  if (!globalForPool.__aetherqPg) {
    globalForPool.__aetherqPg = new Pool({
      connectionString: conn,
      max: Math.min(
        20,
        Math.max(1, Number.parseInt(process.env.DATABASE_POOL_MAX ?? "6", 10) || 6)
      ),
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 12_000,
      ssl:
        process.env.DATABASE_SSL_DISABLE === "1"
          ? undefined
          : { rejectUnauthorized: false },
    });
  }
  return globalForPool.__aetherqPg;
}
