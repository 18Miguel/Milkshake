import { z } from 'zod'

const envSchema = z.object({
    DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN environment is required!'),
    LOAD_SLASH_COMMANDS: z.string().transform((value) => value === 'true').pipe(z.boolean()).optional()
})

export const env = envSchema.parse(process.env)
