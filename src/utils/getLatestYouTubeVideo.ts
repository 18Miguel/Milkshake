import RSSParser from 'rss-parser'
import { youtubeChannelFeedUrl } from './youtubeChannelFeedUrl'

type VideoInfo = {
  id: string,
  title: string,
  link: string,
  shortLink: string,
  publishDate: Date,
  channelId: string,
  channelName: string,
  channelLink: string,
}

export async function getLatestYouTubeVideo(parser: RSSParser, youtubeChannelId: string) {
  const response = await parser.parseURL(youtubeChannelFeedUrl(youtubeChannelId))
  const video = response.items[0]
  const lastVideo: VideoInfo = {
    id: video.id.replace('yt:video:', ''),
    title: video.title!,
    link: video.link!,
    shortLink: `https://youtu.be/${video.id.replace('yt:video:', '')}`,
    publishDate: new Date(video.pubDate!),
    channelId: youtubeChannelId,
    channelName: video.author,
    channelLink: response.link!,
  }

  return lastVideo
}