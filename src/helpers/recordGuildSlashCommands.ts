import { Routes } from 'discord.js'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'

export async function recordGuildSlashCommands(client: IMilkshakeClient, guildId: string, slashCommands?: Array<ISlashCommand>) {
  await client.rest.put(Routes.applicationGuildCommands(client.user!.id!, guildId), {
    body: slashCommands?.map((slashCommand) => slashCommand.data) ??
      client.slashCommands.filter((slashCommand) => slashCommand.type === SlashCommandTypeLevel.Guild)
        .map((slashCommand) => slashCommand.data),
  })
}