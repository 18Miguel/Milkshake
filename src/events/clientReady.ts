import { ActivitiesOptions, ActivityType, Events, PresenceUpdateStatus } from 'discord.js'
import { sql } from 'drizzle-orm'
import RSSParser from 'rss-parser'
import { birthdayScheduler, Logger, loadSlashCommands, recordSlashCommands, loadYouTubeNotifier } from '../helpers'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { IEventHandler } from '../interfaces/eventHandler'
import { database, guilds } from '../database'

const prepareGuildInsert = database.insert(guilds).values({ id: sql.placeholder('id') }).prepare()

async function handleClientReady(client: IMilkshakeClient) {
  const CustomStatus: Array<ActivitiesOptions[]> = [
    [{ name: 'a tornado of flavors.. naahaaah!', type: ActivityType.Watching }],
    [{ name: 'my body temperature.', type: ActivityType.Watching }],
    [{ name: 'the perfect blend of taste and delight.', type: ActivityType.Watching }],
    [{ name: 'the dance of milk and sweetness.', type: ActivityType.Watching }],
    [{ name: 'the symphony of milkshake goodness.', type: ActivityType.Watching }],
  ]

  client.user?.setPresence({
    activities: [{ name: 'Connecting..', type: ActivityType.Listening }],
    status: PresenceUpdateStatus.DoNotDisturb
  })
  setInterval(() => {
    client.user?.setPresence({
      activities: CustomStatus[Math.floor(Math.random() * (CustomStatus.length))],
      status: PresenceUpdateStatus.Online,
    })
  }, 1000 * 60)

  client.logger = new Logger(client)
  client.rssParser = new RSSParser({
    headers: { 'Cache-Control': 'max-age=0' }
  })

  try {
    client.guilds.valueOf().forEach((guild) => {
      prepareGuildInsert.run({ id: guild.id })
    })
  } catch (ignored) {}

  await loadSlashCommands(client)
  await recordSlashCommands(client)
  await birthdayScheduler(client)
  await loadYouTubeNotifier(client)
  
  client.logger.log('Milkshake', `${client.user?.displayName} is ready to taste!`)
  client.logger.logDiscord(`${client.user?.displayName} is ready to taste!`)
}

export default {
  event: Events.ClientReady,
  listener: handleClientReady,
} satisfies IEventHandler<Events.ClientReady>