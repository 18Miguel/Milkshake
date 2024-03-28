import { SlashCommandBuilder } from 'discord.js'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'
import { SlotMachine } from '../utils/games'

const Subcommands = {
  SlotMachine: 'slots',
}

const Games: ISlashCommand = {
  type: SlashCommandTypeLevel.Application,

  data: new SlashCommandBuilder()
    .setName('games')
    .setDescription('Feeling parched for fun? Mix it up with Mini Games!')
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.SlotMachine)
      .setDescription('Spin the Milkshake Machine for the tastiest milkshake ingredients (and maybe a cherry on top!).')
    ),

  execute: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand()

    try {
      switch (subcommand) {
        case Subcommands.SlotMachine: {
          const slotMachine = new SlotMachine()
          await slotMachine.handleInteraction(interaction)
          break
        }
      }
    } catch (error) {
      client.logger.logDiscord(`An error occurred while setting birthday configuration\n${error}`)
    }

    if (!interaction.replied) {
      await interaction.reply({
        ephemeral: true,
        content: `An error has just occurred. :confused:`,
      })
    }
  },
}

export default Games