import { Client, GatewayIntentBits, PresenceUpdateStatus } from 'discord.js'
import { env } from './env'
import { IMilkshakeClient } from './interfaces/milkshakeClient'
import { loadEvents } from './helpers'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  presence: {
    status: PresenceUpdateStatus.DoNotDisturb,
  },
}) as IMilkshakeClient

loadEvents(client)

client.login(env.DISCORD_TOKEN)