import Phaser from 'phaser'
import { PlayerBody } from '../systems/PlayerBody'

export class PlayScene extends Phaser.Scene {
  private player!: PlayerBody
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super({ key: 'PlayScene' })
  }

  create(): void {
    const { width, height } = this.scale

    const floor = this.add.rectangle(width / 2, height - 24, width, 48, 0x3d3d5c)
    this.physics.add.existing(floor, true)

    this.player = new PlayerBody(this, width / 2, height - 120)
    this.physics.add.collider(this.player.sprite, floor)

    // Smoke-test only: one JustDown tap → one impulse. Derrick owns real input.
    this.cursors = this.input.keyboard?.createCursorKeys()
  }

  update(): void {
    if (!this.cursors) {
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.player.bumpLeft()
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.player.bumpRight()
    }
  }
}
