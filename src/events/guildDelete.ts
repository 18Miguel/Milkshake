import { Events, Guild } from 'discord.js'
import { eq } from 'drizzle-orm'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { IEventHandler } from '../interfaces/eventHandler'
import { database, guilds } from '../database'

async function handleGuildDelete(client: IMilkshakeClient, guild: Guild) {
  try {
    await database.delete(guilds).where(eq(guilds.id, guild.id))
    client.logger.logDiscord(`Guild \`${guild.name}\` has been removed.\nGuild ID: ${guild.id}`)

  } catch (error) {
    client.logger.logDiscord(`An error occurred while removing guild \`${guild.name}\`.\nGuild ID: ${guild.id}\n${error}`)
  }
}

export default {
  event: Events.GuildDelete,
  listener: handleGuildDelete,
} satisfies IEventHandler<Events.GuildDelete>