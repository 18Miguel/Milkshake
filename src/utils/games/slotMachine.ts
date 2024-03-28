import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js'

export class SlotMachine {
  private reelsMatrix: Array<string[]>

  constructor(
    private readonly slotsIcons: Array<string> = ['🥛', '🍓', '🍌', '🍒']
  ) {
    this.reelsMatrix = []
    for (let i = 0; i < 3; ++i) {
      this.reelsMatrix[i] = this.getRandomReels()
    }
  }

  private getRandomSymbol() {
    return this.slotsIcons[Math.floor(Math.random() * this.slotsIcons.length)]
  }
  
  private getRandomReels() {
    let reels: Array<string> = []
    for (let i = 0; i < 3; ++i) {
      reels[i] = this.getRandomSymbol()
    }
    return reels
  }

  private spinReels() {
    for (let i = 1; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        this.reelsMatrix[i - 1][j] = this.reelsMatrix[i][j]
      }
    }
    this.reelsMatrix[2] = this.getRandomReels()
  }

  private getSlotsBoard(checkWin?: boolean) {
    return this.reelsMatrix.map((reels, lineIndex) => new ActionRowBuilder<ButtonBuilder>({
      components: reels.map((reel, columnIndex) => new ButtonBuilder({
        custom_id: reel + lineIndex + columnIndex,
        label: reel,
        disabled: true,
        style: lineIndex == 1
          ? checkWin && this.hasWon()
            ? ButtonStyle.Success
            : ButtonStyle.Primary
          : ButtonStyle.Secondary,
      }))
    }))
  }

  private hasWon() {
    return this.reelsMatrix[1][0] === this.reelsMatrix[1][1] &&
      this.reelsMatrix[1][1] === this.reelsMatrix[1][2]
  }

  public async handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()
    const intervalId = setInterval(async () => {
      this.spinReels()
      await interaction.editReply({
        content: `> # Milkshake Machine`,
        components: this.getSlotsBoard(),
      })
    }, 200)

    return await new Promise(async (resolve) => {
      setTimeout(async () => {
        clearInterval(intervalId)
        this.spinReels()
        await interaction.editReply({
          content: `> # Milkshake Machine ${this.hasWon()
            ? '\n> ***Looks like you just aced this game!!!' +
              '\n> But where are all the ingredients for the milkshake?' +
              '\n> Okay, I\'ll see myself out..***'
            : '\n> ***Better luck next blend!' +
              '\n> But hey, your milkshake mixing skills are on point***'}`,
          components: this.getSlotsBoard(true),
        })
        resolve()
      }, Math.floor(Math.random() * 2000 + 2000))
    })
  }
}