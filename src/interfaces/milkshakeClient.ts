import { Client, Collection } from 'discord.js'
import { ISlashCommand } from './slashCommand'
import { Logger } from '../helpers'

export interface IMilkshakeClient extends Client {
  logger: Logger,
  slashCommands: Collection<string, ISlashCommand>,
}