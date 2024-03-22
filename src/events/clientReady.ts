import { ActivitiesOptions, ActivityType, Events, PresenceUpdateStatus } from 'discord.js'
import { Logger, loadSlashCommands, registerSlashCommands } from '../helpers'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { IEventHandler } from '../interfaces/eventHandler'

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
      status: PresenceUpdateStatus.Online
    })
  }, 1000 * 60)

  client.logger = new Logger(client)
  await loadSlashCommands(client)
  await registerSlashCommands(client)
  
  console.info(`\n\n${client.user?.displayName} is ready to taste!\n`)
  client.logger.logDiscord(`${client.user?.displayName} is ready to taste!`)
}

export default {
  event: Events.ClientReady,
  listener: handleClientReady,
} satisfies IEventHandler<Events.ClientReady>