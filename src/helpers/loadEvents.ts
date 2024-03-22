import { readdirSync } from 'fs'
import { join } from 'path'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { IEventHandler } from '../interfaces/eventHandler'

export async function loadEvents(client: IMilkshakeClient) {
  const eventsDirectory = `../${'events'}`
  const eventsAbsolutePathDirectory = join(__dirname, eventsDirectory)
  const eventFiles = readdirSync(eventsAbsolutePathDirectory).filter(file => file.endsWith('.ts'))

  for (const file of eventFiles) {
    try {
      const eventHandler: IEventHandler = (await import(`${eventsDirectory}/${file}`)).default
      client.on(eventHandler.event, (args) => eventHandler.listener(client, args))

    } catch (ignored) {
      console.error(`Error loading event file: "${file}"`)
      process.exit(1)
    }
  }
}