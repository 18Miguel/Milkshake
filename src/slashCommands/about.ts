import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { exec } from 'child_process'
import { ISlashCommand, SlashCommandTypeLevel } from '../interfaces/slashCommand'
import packageJson from '../../package.json'

async function getLastCommitDate(): Promise<Date | undefined> {
  try {
    const { stdout } = exec('git log -1 --date=short --format="%ad" --branches=*master')
    return await new Promise(resolve => {
      stdout?.on('data', (chunk) => resolve(new Date(chunk)))
    })
  } catch (error) {
    return undefined
  }
}

const About: ISlashCommand = {
  type: SlashCommandTypeLevel.Application,

  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Some informantion about me!'),

  execute: async (client, interaction) => {
    const lastUpdate = await getLastCommitDate()
    const aboutEmbed = new EmbedBuilder()
      .setTitle('🍦 Milkshake Recipe')
      .addFields(
        { name: 'Flavor Burst Level', value: packageJson.version, inline: true },
        {
          name: 'Last Scooped Fresh',
          value: lastUpdate
            ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(lastUpdate)
            : 'Needs a Refill!',
          inline: true,
        }
      )
      .setColor(Colors.Orange)
      .setImage(client.user?.displayAvatarURL({ size: 1024 })!)
      .setDescription('Whipped up by the one and only one <@517085467942977536>')
      .setTimestamp()

      await interaction.reply({ embeds: [aboutEmbed] })
  },
}

export default About