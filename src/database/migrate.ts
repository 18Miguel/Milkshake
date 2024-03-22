import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { config } from '../config/configData'

const sqliteDatabase = new Database(config.SQLiteDatabaseFilename)
const database = drizzle(sqliteDatabase)

try {
  migrate(database, {
    migrationsFolder: 'src/database/migrations',
  })
  console.log('Migration successful')

} catch (error) {
  console.error(error)
  process.exit(1)
} finally {
  sqliteDatabase.close()
}