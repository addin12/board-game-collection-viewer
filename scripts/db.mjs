// Direct Postgres access to Supabase for admin/migration tasks.
// Reads the connection string from .env.local (SUPABASE_DB_URL) — never committed.
// Usage: node scripts/db.mjs "select * from sessions limit 5"
//
// We parse the URL into discrete fields by hand and pass the password separately,
// so special characters in the password don't get mangled by URL parsing/encoding.
import pg from 'pg'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const url = env.match(/^SUPABASE_DB_URL=(.+)$/m)?.[1]?.trim() || process.env.SUPABASE_DB_URL
if (!url) {
  console.error('SUPABASE_DB_URL not found in .env.local')
  process.exit(1)
}

// postgresql://<user>:<password>@<host>:<port>/<database>
// `.*` for the password is greedy up to the final `@host:port/db`, so special
// characters (including @, #, %, etc.) in the password are preserved verbatim.
const m = url.match(/^postgres(?:ql)?:\/\/([^:]+):(.*)@([^:/@]+):(\d+)\/(.+)$/)
if (!m) {
  console.error('SUPABASE_DB_URL is not in the expected postgresql://user:pass@host:port/db form')
  process.exit(1)
}
const [, user, password, host, port, database] = m

const sql = process.argv.slice(2).join(' ')
if (!sql) {
  console.error('Usage: node scripts/db.mjs "<SQL>"')
  process.exit(1)
}

const client = new pg.Client({
  host,
  port: Number(port),
  user,
  password,
  database,
  ssl: { rejectUnauthorized: false },
})
await client.connect()
try {
  const res = await client.query(sql)
  console.log(JSON.stringify(res.rows, null, 2))
  console.log(`(${res.rowCount} row${res.rowCount === 1 ? '' : 's'})`)
} finally {
  await client.end()
}
