import { SlashCommandBuilder } from 'discord.js'
import { ISlashCommand } from '../interfaces/slashCommand'

const joke: ISlashCommand = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Milkshake tells a random joke!'),

  execute: async (client, interaction) => {
    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      const data = await response.json()
      await interaction.reply({
        ephemeral: false,
        content: `*${data['joke']}*`,
      })

    } catch (error) {
      await interaction.reply({
        ephemeral: true,
        content: `An error occurred while choosing a joke. :confused:\nIt must be a bad joke.`,
      })
      await client.logger.logDiscord(
        `Error obtained while fetching for a joke!\nError: ${JSON.stringify(error, null, 2)}`
      )
    }
  },
}

export default joke