import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { config } from '../config/configData'
import * as schemas from './schema'

const sqliteDatabase = new Database(config.SQLiteDatabaseFilename)
const database = drizzle(sqliteDatabase, {
  schema: schemas,
})

export default database
