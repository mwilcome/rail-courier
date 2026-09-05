import Phaser from 'phaser'
import { Cart } from './cart'
import { bindBumpInput } from './input'
import { LEVEL, isFail, isGoal, placeLevel } from './level'

export class PlayScene extends Phaser.Scene {
  private cart!: Cart
  private unbindInput?: () => void
  private restartKey?: Phaser.Input.Keyboard.Key
  private hint?: Phaser.GameObjects.Text
  private dim?: Phaser.GameObjects.Rectangle
  private ended = false

  constructor() {
    super({ key: 'PlayScene' })
  }

  create(): void {
    const placed = placeLevel(this)

    this.cart = new Cart(this, LEVEL.playerSpawn.x, LEVEL.playerSpawn.y)
    this.physics.add.collider(this.cart.hull, placed.floor)
    this.physics.add.collider(this.cart.hull, placed.walls)

    this.unbindInput = bindBumpInput(this, this.cart)

    this.dim = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.5)
      .setScrollFactor(0)
      .setDepth(1100)
      .setVisible(false)
      .setInteractive()

    this.hint = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1101)
      .setVisible(false)

    this.dim.on('pointerdown', this.restartScene, this)
    this.restartKey = this.input.keyboard?.addKey('R', true)
    this.restartKey?.on('down', this.restartScene, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
  }

  update(_time: number, delta: number): void {
    if (this.ended) {
      return
    }

    this.cart.update(delta)

    if (this.cart.hasLeftCart()) {
      this.fail('SPILLED\ncargo run over\ntap or press R')
      return
    }

    const { x, y } = this.cart.hull

    if (isFail(x, y)) {
      this.fail('FELL\ntap or press R')
      return
    }

    if (isGoal(x, y)) {
      this.endRun()
      this.time.delayedCall(400, this.restartScene, [], this)
    }
  }

  private fail(message: string): void {
    this.endRun()
    this.cart.spill()
    this.dim?.setVisible(true)
    this.hint?.setText(message).setVisible(true)
  }

  private endRun(): void {
    this.ended = true
    this.cart.lock()
  }

  private restartScene = (): void => {
    this.scene.restart()
  }

  private cleanup = (): void => {
    this.restartKey?.off('down', this.restartScene, this)
    this.dim?.off('pointerdown', this.restartScene, this)
    this.unbindInput?.()
  }
}
