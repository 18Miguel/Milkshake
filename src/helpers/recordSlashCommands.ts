import { Routes } from 'discord.js'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'
import { recordGuildSlashCommands } from './recordGuildSlashCommands'

export async function recordSlashCommands(client: IMilkshakeClient) {
  try {
    const guildIds = client.guilds.valueOf().map(guild => guild.id)
    const slashCommandsFiltered = client.slashCommands.reduce((accumulator, value) => {
      (value.type == SlashCommandTypeLevel.Application
        ? accumulator.application : accumulator.guild
      ).push(value)
      return accumulator
    }, { application: new Array<ISlashCommand>(), guild: new Array<ISlashCommand>() })

		await client.rest.put(Routes.applicationCommands(client.user!.id!), {
      body: slashCommandsFiltered.application.map((slashCommand) => slashCommand.data),
    })
		guildIds.forEach(async (guildId) => {
      await recordGuildSlashCommands(client, guildId, slashCommandsFiltered.guild)
    })
    client.logger.log('registerSlashCommands', 'Successfully reloaded application (/) slash commands')

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}