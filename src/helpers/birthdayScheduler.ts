import { CronJob } from 'cron'
import { and, eq, sql } from 'drizzle-orm'
import { Colors, EmbedBuilder } from 'discord.js'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { database, guilds, guildsToUsers, users } from '../database'

const GIFs = [
  'https://media.tenor.com/KgH3rIR-k3MAAAAC/roland-birthday.gif',
  'https://media.tenor.com/ufuYtIqIsIgAAAAC/tenor.gif',
  'https://i.giphy.com/media/66dLOWrLqrgxWHSeVR/giphy.gif',
]

const usersBirthdayPrepare = database
  .select({ id: users.id, birthdayDate: users.birthdayDate })
  .from(users)
  .innerJoin(guildsToUsers, eq(users.id, guildsToUsers.userId))
  .where(and(
    sql`strftime('2000-%m-%d', date(${users.birthdayDate}, 'auto')) == strftime('2000-%m-%d', date('now', 'auto'))`,
    eq(guildsToUsers.guildId, sql.placeholder('guildId'))
  ))
  .prepare()

export async function birthdayScheduler(client: IMilkshakeClient) {
  const job = new CronJob('0 0 0 * * *', async () => {
    try {
      const guildsSettings = await database
        .select({
          id: guilds.id,
          birthdayRole: guilds.birthdayRole,
          birthdayChannel: guilds.birthdayChannel
        })
        .from(guilds)

      for (const guildData of guildsSettings) {
        const guild = client.guilds.cache.get(guildData.id)
        await guild?.members.fetch()
        const birthdayRole = guild?.roles.cache.get(guildData.birthdayRole ?? '')
        const birthdayChannel = guild?.channels.cache.get(guildData.birthdayChannel ?? '')

        if (!birthdayRole && !birthdayChannel) continue
        birthdayRole?.members.forEach(async (member) => await member.roles.remove(birthdayRole))

        const usersBirthday = usersBirthdayPrepare.all({ guildId: guildData.id })

        for (const user of usersBirthday) {
          const member = await guild?.members.fetch(user.id)
          if (!member) continue
          if (birthdayRole) await member?.roles.add(birthdayRole)
          if (!birthdayChannel?.isTextBased()) continue

          const BirthdayEmbed = new EmbedBuilder()
            .setTitle(`🎉 Happy Birthday!`)
            .setDescription(`**Wishes <@${member.id}> a happy birthday!**`)
            .setThumbnail(member.displayAvatarURL({ size: 1024 }))
            .setImage(GIFs[Math.floor(Math.random() * (GIFs.length))])
            .setColor(Colors.Orange)
            .setTimestamp()

          birthdayChannel.send({ embeds: [BirthdayEmbed] })
        }
      }
      
      client.logger.log('birthdayScheduler', 'Birthday check completed successfully')
    } catch (error) {
      client.logger.log('birthdayScheduler', `${error}`)
    }
  }, null, true, undefined, null, true)
}