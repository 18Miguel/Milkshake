import { Collection, SlashCommandBuilder } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { ISlashCommand } from '../interfaces/slashCommand'

export async function loadSlashCommands(client: IMilkshakeClient) {
  const slashCommandsDirectory = `../${'slashCommands'}`
  const slashCommandsAbsolutePathDirectory = join(__dirname, slashCommandsDirectory)
  const slashCommandsFiles = readdirSync(slashCommandsAbsolutePathDirectory).filter(file => file.endsWith('.ts'))
  client.slashCommands = new Collection()
  client.logger.log('loadSlashCommands', 'Loading commands files..')

  for (const file of slashCommandsFiles) {
    try {
      const slashCommand: ISlashCommand = (await import(`${slashCommandsDirectory}/${file}`)).default
      client.slashCommands.set((slashCommand.data as SlashCommandBuilder).name, slashCommand)
      client.logger.log('loadSlashCommands', `✔ ${file} loaded!`)

    } catch (ignored) {
      console.error(`Error loading slash command file: "${file}"`, ignored)
      process.exit(1)
    }
  }
}