import { z } from 'zod';
import configJSON from './config.json';

const configSchema = z.object({
  SQLiteDatabaseFilename: z.string(),
  DiscordLogTextChannel: z.string(),
})

export const config = configSchema.parse(configJSON)
