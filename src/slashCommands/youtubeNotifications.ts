import { ChannelType, ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { and, eq, sql } from 'drizzle-orm'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'
import { database, youtubeChannels, youtubeSubscriptions } from '../database'
import { getLatestYouTubeVideo, youtubeChannelFeedUrl } from '../utils'

const Subcommands = {
  AddChannel: 'add-channel',
  RemoveChannel: 'remove-channel',
  SubscribedChannels: 'subscribed-channels'
}

const checkYouTubeChannel = database
  .select({ id: youtubeChannels.id })
  .from(youtubeChannels)
  .where(eq(youtubeChannels.id, sql.placeholder('id')))
  .prepare()

const checkYouTubeSubscription = database
  .select({ id: youtubeSubscriptions.id })
  .from(youtubeSubscriptions)
  .where(and(
    eq(youtubeSubscriptions.youtubeChannelId, sql.placeholder('youtubeChannelId')),
    eq(youtubeSubscriptions.guildId, sql.placeholder('guildId')),
  ))
  .prepare()

async function handleAddChannel(client: IMilkshakeClient, interaction: ChatInputCommandInteraction) {
  const youtubeChannelId = interaction.options.getString('youtube-channel-id', true)
  const discordChannel = interaction.options.getChannel('discord-channel', true)
  const response = await client.rssParser.parseURL(youtubeChannelFeedUrl(youtubeChannelId))
    .catch(async (error: Error) => error)

  if (response instanceof Error || (response.message as string)?.includes('404')) {
    await interaction.reply({
      ephemeral: true,
      content: 'Please provide an valid YouTube channel id!',
    })
    return
  }
  
  if (!checkYouTubeChannel.get({ id: youtubeChannelId })?.id) {
    await database.insert(youtubeChannels).values({ id: youtubeChannelId })
  }

  const youtubeSubscriptionId = checkYouTubeSubscription.get({ youtubeChannelId, guildId: interaction.guildId! })?.id

  if (!youtubeSubscriptionId) {
    await database.insert(youtubeSubscriptions)
      .values({
        youtubeChannelId: youtubeChannelId,
        guildId: interaction.guildId!,
        guildTextChannelId: discordChannel.id,
      })
  } else {
    await database.update(youtubeSubscriptions)
      .set({
        youtubeChannelId: youtubeChannelId,
        guildId: interaction.guildId!,
        guildTextChannelId: discordChannel.id,
      })
      .where(eq(youtubeSubscriptions.id, youtubeSubscriptionId))
  }

  await interaction.reply({
    content: `YouTube channel [${response.title}](${response.link}) has been successfully set to the channel <#${discordChannel.id}>`,
  })
}

async function handleRemoveChannel(interaction: ChatInputCommandInteraction) {
  const youtubeChannelId = interaction.options.getString('youtube-channel-id', true)
  const youtubeSubscriptionId = checkYouTubeSubscription.get({ youtubeChannelId, guildId: interaction.guildId! })?.id

  if (!youtubeSubscriptionId) {
    await interaction.reply({
      ephemeral: true,
      content: 'There is no YouTube subscription with the provided ID',
    })
    return
  }
  await database.transaction(async (transactionDatabase) => {
    await transactionDatabase
      .delete(youtubeSubscriptions)
      .where(and(
        eq(youtubeSubscriptions.youtubeChannelId, youtubeChannelId),
        eq(youtubeSubscriptions.guildId, interaction.guildId!)
      ))
  
    if (checkYouTubeChannel.get({ id: youtubeChannelId })?.id) {
      await transactionDatabase
        .delete(youtubeChannels)
        .where(eq(youtubeChannels.id, youtubeChannelId))
    }
  })

  await interaction.reply({
    content: `YouTube channel ID \`${youtubeChannelId}\` has been successfully removed`
  })
}

async function handleSubscribedChannels(client: IMilkshakeClient, interaction: ChatInputCommandInteraction) {
  const guildYouTubeSubscriptions = await database.query.youtubeSubscriptions.findMany({
    where: (youtubeSubscription, { eq }) => eq(youtubeSubscription.guildId, interaction.guildId!),
  })

  const videoInfoArray = await Promise.all(
    guildYouTubeSubscriptions.map(async ({ youtubeChannelId, guildTextChannelId }) => ({
      ...await getLatestYouTubeVideo(client.rssParser, youtubeChannelId),
      guildTextChannelId,
    }))
  )

  const subscribedChannelsEmbed = new EmbedBuilder()
    .setTitle('YouTube Channels Subscribed')
    .setColor(Colors.Orange)

  videoInfoArray.forEach((videoInfo) => subscribedChannelsEmbed.addFields({
    name: `${videoInfo.channelName}`,
    value: `[YouTube Channel](${videoInfo.channelLink}) ID: \`${videoInfo.channelId}\` **—** <#${videoInfo.guildTextChannelId}>`,
  }))

  await interaction.reply({
    embeds: [subscribedChannelsEmbed]
  })
}

const YouTubeNotifications: ISlashCommand = {
  type: SlashCommandTypeLevel.Guild,

  data: new SlashCommandBuilder()
    .setName('youtube-notifications')
    .setDescription('Notification manager for YouTube channels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.AddChannel)
      .setDescription('Add a YouTube channel for video notifications.')
      .addStringOption((option) => option
        .setName('youtube-channel-id')
        .setDescription('In the YouTube channel\'s About Tab, click on Share under Stats and select Copy Channel ID.')
        .setRequired(true))
      .addChannelOption((option) => option
        .setName('discord-channel')
        .setDescription('Discord channel where new notifications should be posted.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.RemoveChannel)
      .setDescription('Removes a previously added YouTube channel.')
      .addStringOption((option) => option
        .setName('youtube-channel-id')
        .setDescription('In the YouTube channel\'s About Tab, click on Share under Stats and select Copy Channel ID.')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.SubscribedChannels)
      .setDescription('Get subcribed channels.')),

  execute: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand()

    try {
      switch (subcommand) {
        case Subcommands.AddChannel:
          await handleAddChannel(client, interaction)
          break
        case Subcommands.RemoveChannel:
          await handleRemoveChannel(interaction)
          break
        case Subcommands.SubscribedChannels:
          await handleSubscribedChannels(client, interaction)
          break
      }
    } catch (error) {
      client.logger.logDiscord(`An error occurred while setting youtube configuration\n${error}`)
    }

    if (!interaction.replied) {
      await interaction.reply({
        ephemeral: true,
        content: `An error has just occurred. :confused:`,
      })
    }
  },
}

export default YouTubeNotifications