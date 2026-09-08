import postgres from 'postgres';
import fs from 'fs';

const connectionString = "postgresql://postgres:3%2A%40%2Fpj%2AB_SttCu2@db.scjesypkyukjytosgout.supabase.co:5432/postgres";

// We need to use IPv4 session pooler instead of direct connection because direct times out
const poolerConnectionString = "postgresql://postgres.scjesypkyukjytosgout:3%2A%40%2Fpj%2AB_SttCu2@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

const sql = postgres(poolerConnectionString, {
  ssl: 'require',
});

async function main() {
  try {
    const schema = fs.readFileSync('schema.sql', 'utf8');
    console.log("Running migration...");
    await sql.unsafe(schema);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

main();
