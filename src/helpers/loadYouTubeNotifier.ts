import { CronJob } from 'cron'
import { count, eq, sql } from 'drizzle-orm'
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

const checkLastYouTubeVideo = database
  .select({ count: count() })
  .from(youtubeChannels)
  .where(eq(youtubeChannels.lastVideoId, sql.placeholder('lastVideoId')))
  .prepare()

export async function loadYouTubeNotifier(client: IMilkshakeClient) {
  new CronJob('0 */1 * * * *', async () => {
    try {
      for (const youtubeChannel of youtubeChannelsPrepare.all()) {
        const lastVideo = await getLatestYouTubeVideo(client.rssParser, youtubeChannel.id)
        if (checkLastYouTubeVideo.get({ lastVideoId: lastVideo.id })?.count === 1) continue
        await database
          .update(youtubeChannels)
          .set({ lastVideoId: lastVideo.id })
          .where(eq(youtubeChannels.id, youtubeChannel.id))

        for (const youtubeSubscription of youtubeSubscriptionsPrepare.all({ youtubeChannelId: youtubeChannel.id })) {
          const discordChannel = client.channels.cache.get(youtubeSubscription.guildTextChannelId)
          if (!discordChannel?.isTextBased()) continue
          await discordChannel.send({ content: lastVideo.shortLink })
        }
      }

    } catch (error) {
      client.logger.log('loadYouTubeNotifier', `${error}`)
    }
  }).start()
}