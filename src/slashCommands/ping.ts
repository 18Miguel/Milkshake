import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'

const Ping: ISlashCommand = {
  type: SlashCommandTypeLevel.Application,

  data: new SlashCommandBuilder()
    .setName('health')
    .setDescription('Confirms that the Milkshake is still tasty'),

  execute: async (client, interaction) => {
    const delay = client.ws.ping
    const isSlow = delay > 100

    const pongEmbed = new EmbedBuilder()
			.setColor(isSlow ? Colors.Red : Colors.Green)
      .setDescription(`${isSlow
        ? 'Uh oh, the milkshake is a bit thick!'
        : 'The milkshake is still running smoothly!'} It responded in ${delay}ms.`)

    await interaction.reply({
      ephemeral: true,
      embeds: [pongEmbed],
    })
  },
}

export default Ping