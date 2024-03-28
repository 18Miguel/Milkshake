import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'
import { database, guildsToUsers, users } from '../database'
import { and, count, eq, sql } from 'drizzle-orm'

const Subcommands = {
  AddBirthday: 'add-birthday',
  RemoveBirthday: 'remove-birthday',
  UpcomingBirthdays: 'upcoming-birthdays',
}

const findNextBirthdays = database
  .select({ id: users.id, birthdayDate: users.birthdayDate })
  .from(users)
  .innerJoin(guildsToUsers, eq(users.id, guildsToUsers.userId))
  .where(eq(guildsToUsers.guildId, sql.placeholder('guildId')))
  .orderBy(sql`timediff(strftime('2000-%m-%d', date(${users.birthdayDate}, 'auto')), strftime('2000-%m-%d', date('now', 'auto'))) ASC`)
  .limit(sql.placeholder('limit'))
  .prepare()

async function handleAddBirthday(interaction: ChatInputCommandInteraction) {
  const birthdayMonth = interaction.options.getInteger('birthday-month', true)
  const birthdayDay = interaction.options.getInteger('birthday-day', true)
  const birthdayYear = interaction.options.getInteger('birthday-year', false)
  const userID = interaction.user.id

  const today = new Date()
  const birthdayDate = new Date(`${birthdayMonth}-${birthdayDay}-${birthdayYear ?? 0}`)
  !birthdayYear && birthdayDate.setFullYear(0)

  if ((birthdayYear && birthdayYear > today.getFullYear()) || birthdayDate.getTime() > today.getTime()) {
    await interaction.reply({
      ephemeral: true,
      content: 'Bummer! Looks like there\'s a glitch in the birthday matrix.\nPlease introduce a valid date.',
    })
  }

  await database.insert(users)
    .values({ id: userID, birthdayDate: birthdayDate })
    .onConflictDoUpdate({
      target: users.id,
      set: { birthdayDate: birthdayDate },
    })
  await database.insert(guildsToUsers)
    .values({ guildId: interaction.guildId!, userId: userID })
    .catch(() => {})

  const formatedDate = birthdayDate.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: birthdayYear ? 'numeric' : undefined,
  })
  await interaction.reply({
    ephemeral: true,
    content: birthdayYear
      ? `Holy Shakes! Looks like your birthday was on **${formatedDate}**.` +
        `\nBut hey, it's never too late to raise a glass (or a milkshake 😉).`
      : `Your birthday's about to be scooped up by Milkshake!` +
        `\nReminder set for **${formatedDate}**.\nGet ready for a birthday shake-tacular celebration!`,
  })
}

async function handleRemoveBirthday(interaction: ChatInputCommandInteraction) {
  const userID = interaction.user.id

  const deleteResult = await database.delete(guildsToUsers)
    .where(and(eq(guildsToUsers.guildId, interaction.guildId!), eq(guildsToUsers.userId, userID)))
  const countUserResult = (await database
    .select({ count: count() })
    .from(guildsToUsers)
    .where(eq(guildsToUsers.userId, userID))).at(0)

  if (countUserResult?.count === 0) {
    await database.delete(users)
      .where(eq(users.id, userID))
  }

  await interaction.reply({
    ephemeral: true,
    content: deleteResult.changes === 0
      ? 'Whoa there, birthday slayer! No birthday data to vanquish today.'
      : 'Mission accomplished! Your birthday data has been blasted off to oblivion.',
  })
}

async function handleUpcomingBirthdays(interaction: ChatInputCommandInteraction) {
  const numOfBirthdays = interaction.options.getInteger('num-of-birthdays', false) ?? 10
  const nextBirthdays = findNextBirthdays.all({ guildId: interaction.guildId!, limit: numOfBirthdays })

  if (!nextBirthdays || nextBirthdays.length <= 0) {
    await interaction.reply({
        content: 'No upcoming birthdays found. :confused:',
        ephemeral: true
    })
    return
  }

  const currentDate = new Date()
  const birthdaysEmbed = new EmbedBuilder()
    .setTitle('🎂 Upcoming Birthdays')
    .setColor(Colors.Orange)

  nextBirthdays.forEach((user) => {
    const userAge = currentDate.getFullYear() - (user.birthdayDate?.getFullYear()! || currentDate.getFullYear())
    const birthdayDate = user.birthdayDate?.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: userAge > 0 ? 'numeric' : undefined,
    })
    birthdaysEmbed.addFields({
      name: `${birthdayDate} ${userAge > 0 ? `(${userAge})` : ``}`,
      value: `<@${user.id}>`,
    })
  })

  await interaction.reply({ embeds: [birthdaysEmbed] })
}

const BirthdayReminder: ISlashCommand = {
  type: SlashCommandTypeLevel.Guild,

  data: new SlashCommandBuilder()
    .setName('birthday-reminder')
    .setDescription('...')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.AddBirthday)
      .setDescription('Add a reminder to your birthday.')
      .addIntegerOption((option) => option
        .setName('birthday-month')
        .setDescription('The month of your birthday.')
        .setMinValue(1)
        .setMaxValue(12)
        .setRequired(true))
      .addIntegerOption((option) => option
        .setName('birthday-day')
        .setDescription('The day of your birthday.')
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(true))
      .addIntegerOption((option) => option
        .setName('birthday-year')
        .setDescription('The year of your birthday.')
        .setMinValue(1900)
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.RemoveBirthday)
      .setDescription('Remove your birthday data.'))
    .addSubcommand((subcommand) => subcommand
      .setName(Subcommands.UpcomingBirthdays)
      .setDescription('Get upcoming birthdays.')
      .addIntegerOption((option) => option
        .setName('num-of-birthdays')
        .setDescription('The number of future birthday dates.')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false))),

  execute: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand()

    try {
      switch (subcommand) {
        case Subcommands.AddBirthday:
          await handleAddBirthday(interaction)
          break
  
        case Subcommands.RemoveBirthday:
          await handleRemoveBirthday(interaction)
          break
  
        case Subcommands.UpcomingBirthdays:
          await handleUpcomingBirthdays(interaction)
          break
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

export default BirthdayReminder