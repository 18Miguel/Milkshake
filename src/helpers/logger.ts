import { Channel, Client } from 'discord.js'
import { config } from '../config/configData'

export class Logger {
  private logChannel?: Channel

  constructor(client: Client) {
    this.logChannel = client.channels.cache.get(config.DiscordLogTextChannel)
  }

  public async logDiscord(message: string) {
    if (!this.logChannel) {
      console.error('Method: sendLog\nMessage: Channel not found.')
      return
    }

    try {
      if (this.logChannel.isTextBased())
        await this.logChannel.send(`> \`\`\`js\n> ${new Date().toLocaleString()}\n> ${message.replace('\n', '\n> ')}\n> \`\`\``)
    } catch (error) {
      console.error('Method: sendLog\nError:', error)
    }
  }

  public log(instanceName: string, message: string) {
    console.log(`${new Date().toLocaleString()} [${instanceName}] - ${message}`)
  }
}