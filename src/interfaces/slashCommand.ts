import { ChatInputCommandInteraction, SharedNameAndDescription, SharedSlashCommandOptions, SlashCommandBuilder } from 'discord.js'
import { IMilkshakeClient } from './milkshakeClient'

export enum SlashCommandTypeLevel {
  Application, Guild
}

export interface ISlashCommand {
  type: SlashCommandTypeLevel,
  data: SlashCommandBuilder | SharedNameAndDescription | SharedSlashCommandOptions,
  execute: (client: IMilkshakeClient, interaction: ChatInputCommandInteraction) => Promise<void>,
}