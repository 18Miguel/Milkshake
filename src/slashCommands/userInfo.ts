import { Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'

const UserInfo: ISlashCommand = {
  type: SlashCommandTypeLevel.Guild,

  data: new SlashCommandBuilder()
    .setName('user-information')
    .setDescription('Display info about yourself.')
    .addUserOption(option => option
        .setName('target')
        .setDescription('The user\'s info to show')
        .setRequired(false)),

  execute: async (_, interaction) => {
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' }
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true }
    const user = interaction.options.getUser('target', false)
    let member = interaction.guild?.members.cache.get(interaction.user.id)

    if (user && user.id !== interaction.user.id) {
      if (!member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        await interaction.reply({
          ephemeral: true,
          content: 'Oh no no! :disappointed:\nYou are not allowed to use this slash command!',
        })
        return
      }
      member = interaction.guild?.members.cache.get(user.id)
    }

    const userEmbed = new EmbedBuilder()
      .setTitle(`🔎 Your Info`)
      .addFields(
        { name: `Your user Tag`, value: `<@${user?.id ?? interaction.user.id}>`, inline: true },
        { name: `Your user ID`, value: `${user?.id ?? interaction.user.id}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        {
          name: 'Joined Discord',
          value: `${new Date(user?.createdTimestamp ?? interaction.user.createdTimestamp).toLocaleDateString('en-us', optionsDate as any)}\n` +
            `${new Date(user?.createdTimestamp ?? interaction.user.createdTimestamp).toLocaleTimeString('en-us', optionsTime as any)}`,
          inline: true,
        },
        {
          name: 'Joined Server',
          value: `${new Date(member?.joinedTimestamp!).toLocaleDateString('en-us', optionsDate as any)}\n` +
            `${new Date(member?.joinedTimestamp!).toLocaleTimeString('en-us', optionsTime as any)}`,
          inline: true,
        },
        { name: '\u200B', value: '\u200B', inline: true }
      )
      .setThumbnail((user ?? interaction.user).displayAvatarURL({ size: 1024 }))
      .setColor(Colors.Orange)
      .setTimestamp()

    await interaction.reply({ embeds: [userEmbed] })
  },
}

export default UserInfo