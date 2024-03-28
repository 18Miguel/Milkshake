import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { config } from '../config/configData'
import * as schemas from './schema'
export * from './schema'

const sqliteDatabase = new Database(config.SQLiteDatabaseFilename)
export const database = drizzle(sqliteDatabase, {
  schema: schemas,
})