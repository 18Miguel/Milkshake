import { PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { ISlashCommand } from '../interfaces/slashCommand'

const clearChannel: ISlashCommand = {
  data: new SlashCommandBuilder()
    .setName('clear-channel')
    .setDescription('Deletes up to 100 messages from this channel. \nPinned messages will be kept.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete.')
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(true)),

  execute: async (client, interaction) => {
    const amount = interaction.options.getInteger('amount', true)

    try {
      const messages = await interaction.channel!.messages.fetch({ limit: amount })
      const deletableMessages = messages.filter(message => !message.pinned)

      if (deletableMessages?.size === 0) {
        await interaction.reply({
          ephemeral: true,
          content: 'There are no messages to delete in this channel.',
        })
        return
      }

      try {
				deletableMessages.forEach(message =>
					interaction.channel!.messages.fetch(message.id)
						.then(messageFetched => messageFetched.delete())
						.catch(error => (error && error.status == 404) ? null : console.error(error)))
			} catch (ignored) { }

      await client.logger.logDiscord(
				`The user ${interaction.user.displayName} has deleted ${deletableMessages.size} messages ` +
        `from the "${(interaction.channel as TextChannel).name ?? 'unknown'}" channel, ` +
				`in "${interaction.guild?.name}" guild.\nUser ID: ${interaction.user.id}`
      )

      await interaction.reply({
        ephemeral: true,
        content: `Deleting ${deletableMessages.size} messages from this channel..`,
      })
      return

    } catch (error) {
      await client.logger.logDiscord(`Command: clear-channel\nError: ${error}`)
    }
  },
}

export default clearChannel