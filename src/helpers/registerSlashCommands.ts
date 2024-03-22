import { Routes } from 'discord.js'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'

export async function registerSlashCommands(client: IMilkshakeClient) {
  try { 
		await client.rest.put(Routes.applicationCommands(client.user!.id!), {
      body: client.slashCommands.map((slashCommand) => slashCommand.data),
    })
    client.logger.log('registerSlashCommands', 'Successfully reloaded application (/) slash commands')

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}