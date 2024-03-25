import { Events, Guild } from 'discord.js'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { IEventHandler } from '../interfaces/eventHandler'
import { database, guilds } from '../database'
import { recordGuildSlashCommands } from '../helpers'

async function handleGuildCreate(client: IMilkshakeClient, guild: Guild) {
  try {
    await database.insert(guilds).values({ id: guild.id })
    await recordGuildSlashCommands(client, guild.id)
    client.logger.logDiscord(`Guild \`${guild.name}\` has been added.\nGuild ID: ${guild.id}`)

  } catch (error) {
    client.logger.logDiscord(`An error occurred while adding guild \`${guild.name}\`.\nGuild ID: ${guild.id}\n${error}`)
  }
}

export default {
  event: Events.GuildCreate,
  listener: handleGuildCreate,
} satisfies IEventHandler<Events.GuildCreate>