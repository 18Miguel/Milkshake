import { Client, Collection } from 'discord.js'
import RSSParser from 'rss-parser'
import { ISlashCommand } from './slashCommand'
import { Logger } from '../helpers'

export interface IMilkshakeClient extends Client {
  slashCommands: Collection<string, ISlashCommand>,
  logger: Logger,
  rssParser: RSSParser,
}