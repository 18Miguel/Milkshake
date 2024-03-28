import { CronJob } from 'cron'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import { IMilkshakeClient } from '../interfaces/milkshakeClient'
import { database, youtubeChannels, youtubeSubscriptions } from '../database'
import { getLatestYouTubeVideo } from '../utils'

const youtubeChannelsPrepare = database
  .select()
  .from(youtubeChannels)
  .prepare()

const youtubeSubscriptionsPrepare = database
  .select({ guildTextChannelId: youtubeSubscriptions.guildTextChannelId })
  .from(youtubeSubscriptions)
  .where(eq(youtubeSubscriptions.youtubeChannelId, sql.placeholder('youtubeChannelId')))
  .prepare()

export async function youtubeNotifierScheduler(client: IMilkshakeClient) {
  new CronJob('0 */1 * * * *', async () => {
    try {
      for (const youtubeChannel of youtubeChannelsPrepare.all()) {
        const lastVideo = await getLatestYouTubeVideo(client.rssParser, youtubeChannel.id)
        const checkLastYouTubeVideo = database
          .select({ count: count() })
          .from(youtubeChannels)
          .where(and(
            eq(youtubeChannels.id, youtubeChannel.id),
            gte(youtubeChannels.lastVideoPublishDate, lastVideo.publishDate)
          )).get()

        if (checkLastYouTubeVideo?.count === 1) continue

        await database
          .update(youtubeChannels)
          .set({ lastVideoId: lastVideo.id, lastVideoPublishDate: lastVideo.publishDate })
          .where(eq(youtubeChannels.id, youtubeChannel.id))

        for (const youtubeSubscription of youtubeSubscriptionsPrepare.all({ youtubeChannelId: youtubeChannel.id })) {
          const discordChannel = client.channels.cache.get(youtubeSubscription.guildTextChannelId)
          if (!discordChannel?.isTextBased()) continue
          await discordChannel.send({ content: lastVideo.shortLink })
        }
      }

    } catch (error) {
      client.logger.log('youtubeNotifierScheduler', `${error}`)
    }
  }).start()
}