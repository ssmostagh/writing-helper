import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import * as schema from './schema'

const dbPath = path.join(process.cwd(), 'data', 'writing-companion.db')

// Create data directory if it doesn't exist
import fs from 'fs'
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize database connection
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

// Run migrations
try {
  migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  console.log('Database migrations completed successfully')
} catch (error) {
  console.error('Error running migrations:', error)
}

export { schema }
export * from './schema'