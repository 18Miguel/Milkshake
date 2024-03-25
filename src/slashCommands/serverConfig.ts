import { ChannelType, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'
import { database, guilds } from '../database'
import { eq } from 'drizzle-orm'

const Subcommands = {
  BirthdayConfig: 'birthday-config',
}

const ServerConfig: ISlashCommand = {
  type: SlashCommandTypeLevel.Guild,

  data: new SlashCommandBuilder()
    .setName('server-config')
    .setDescription('Configure server settings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.BirthdayConfig)
      .setDescription('Settings for birthday reminders.')
      .addRoleOption((option) => option
        .setName('birthday_role')
        .setDescription('The role that will be assigned to members on their birthdays.')
        .setRequired(false))
      .addChannelOption((option) => option
        .setName('birthday_channel')
        .setDescription('The channel where birthday reminders will be sent.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false))),

  execute: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand()
    const birthdayRole = interaction.options.getRole('birthday_role', false)
    const birthdayChannel = interaction.options.getChannel('birthday_channel', false)

    try {
      switch (subcommand) {
        case Subcommands.BirthdayConfig: {
          await database.update(guilds)
            .set({
              birthdayRole: birthdayRole?.id ?? null,
              birthdayChannel: birthdayChannel?.id ?? null,
            })
            .where(eq(guilds.id, interaction.guildId!))

          const birthdayConfigEmbed = new EmbedBuilder()
            .setTitle('🎂 Birthday configuration')
            .setColor(Colors.Orange)

          birthdayRole?.id && birthdayConfigEmbed.addFields({
            name: 'Role',
            value: `<@&${birthdayRole?.id}>`,
            inline: true,
          })
          
          birthdayChannel?.id && birthdayConfigEmbed.addFields({
            name: 'Channel',
            value: `<#${birthdayChannel?.id}>`,
            inline: true,
          })

          await interaction.reply({
            embeds: [birthdayConfigEmbed],
          })
          break
        }
      }
    } catch (error) {
      client.logger.logDiscord(`An error occurred while setting guild birthday configuration\n${error}`)
    }

    if (!interaction.replied) {
      await interaction.reply({
        ephemeral: true,
        content: `An error has just occurred. :confused:`,
      })
    }
  },
}

export default ServerConfig