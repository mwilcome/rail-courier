import Phaser from 'phaser'
import { bumpLeft, bumpRight } from './BumpImpulse'

export class PlayerBody {
  readonly sprite: Phaser.GameObjects.Rectangle
  readonly body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 36, 48, 0xff6b35)
    scene.physics.add.existing(this.sprite)

    const body = this.sprite.body
    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error('PlayerBody expected a dynamic Arcade body')
    }

    this.body = body
    this.body.setCollideWorldBounds(true)
    this.body.setDragX(500)
    this.body.setMaxVelocity(640, 2000)
  }

  bumpLeft(): void {
    bumpLeft(this.body)
  }

  bumpRight(): void {
    bumpRight(this.body)
  }
}
