// Direct Postgres access to Supabase for admin/migration tasks.
// Reads the connection string from .env.local (SUPABASE_DB_URL) — never committed.
// Usage: node scripts/db.mjs "select * from sessions limit 5"
import pg from 'pg'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const conn = env.match(/^SUPABASE_DB_URL=(.+)$/m)?.[1]?.trim() || process.env.SUPABASE_DB_URL
if (!conn) {
  console.error('SUPABASE_DB_URL not found in .env.local')
  process.exit(1)
}

const sql = process.argv.slice(2).join(' ')
if (!sql) {
  console.error('Usage: node scripts/db.mjs "<SQL>"')
  process.exit(1)
}

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
await client.connect()
try {
  const res = await client.query(sql)
  console.log(JSON.stringify(res.rows, null, 2))
  console.log(`(${res.rowCount} row${res.rowCount === 1 ? '' : 's'})`)
} finally {
  await client.end()
}
