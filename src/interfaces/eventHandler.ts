import { Awaitable, ClientEvents } from 'discord.js'
import { IMilkshakeClient } from './milkshakeClient'

export interface IEventHandler<Event extends keyof ClientEvents = any> {
  event: Event,
  listener: (client: IMilkshakeClient, ...args: ClientEvents[Event]) => Awaitable<void>,
}