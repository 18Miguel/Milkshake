import { ChatInputCommandInteraction, SharedNameAndDescription, SharedSlashCommandOptions, SlashCommandBuilder } from 'discord.js'
import { IMilkshakeClient } from './milkshakeClient';

export interface ISlashCommand {
  data: SlashCommandBuilder | SharedNameAndDescription | SharedSlashCommandOptions,
  execute: (client: IMilkshakeClient, interaction: ChatInputCommandInteraction) => Promise<void>,
}