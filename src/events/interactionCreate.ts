import { Events, Interaction } from 'discord.js'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { IEventHandler } from '../interfaces/eventHandler'

async function handleInteractionCreate(client: IMilkshakeClient, interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    try {
      const slashCommand = client.slashCommands.get(interaction.commandName)
      if (!slashCommand) {
        throw new Error(`${interaction.commandName}, slash command not found`)
      }
      slashCommand.execute(client, interaction)

    } catch (error) {
      console.error(error)
      await client.logger.logDiscord(`${error}`)

      if (interaction) {
        await interaction.reply({
          ephemeral: true,
          content: 'There was an error while executing this command! :confused:',
        })
      }
    }
  }
}

export default {
  event: Events.InteractionCreate,
  listener: handleInteractionCreate,
} satisfies IEventHandler<Events.InteractionCreate>