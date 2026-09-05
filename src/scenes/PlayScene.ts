import Phaser from 'phaser'
import { createBumpInput, type BumpInput } from '../input/BumpInput'
import { SLICE0, isSlice0Fail, isSlice0Goal, placeSlice0 } from '../levels/slice0'
import { PlayerBody } from '../systems/PlayerBody'
import { createBumpButtons, type BumpButtons } from '../ui/BumpButtons'
import { createRestartHint, type RestartHint } from '../ui/RestartHint'

export class PlayScene extends Phaser.Scene {
  private player!: PlayerBody
  private bumpInput?: BumpInput
  private bumpButtons?: BumpButtons
  private restartHint?: RestartHint
  private restartKey?: Phaser.Input.Keyboard.Key
  private ended = false

  constructor() {
    super({ key: 'PlayScene' })
  }

  create(): void {
    const placed = placeSlice0(this)

    this.player = new PlayerBody(this, SLICE0.playerSpawn.x, SLICE0.playerSpawn.y)
    this.physics.add.collider(this.player.sprite, placed.floor)
    this.physics.add.collider(this.player.sprite, placed.walls)

    this.bumpInput = createBumpInput(this, this.player)
    this.bumpButtons = createBumpButtons(this, this.player)
    this.restartHint = createRestartHint(this)

    this.restartKey = this.input.keyboard?.addKey('R', true)
    this.restartKey?.on('down', this.restartScene, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
  }

  update(): void {
    if (this.ended) {
      return
    }

    const { x, y } = this.player.sprite

    if (isSlice0Fail(x, y)) {
      this.endRun(true)
      return
    }

    if (isSlice0Goal(x, y)) {
      this.endRun(false)
    }
  }

  private endRun(failed: boolean): void {
    this.ended = true
    this.player.body.setVelocity(0, 0)
    this.player.body.enable = false

    if (failed) {
      this.restartHint?.show()
      return
    }

    this.time.delayedCall(400, this.restartScene, [], this)
  }

  private restartScene = (): void => {
    this.scene.restart()
  }

  private cleanup = (): void => {
    this.restartKey?.off('down', this.restartScene, this)
    this.bumpInput?.destroy()
    this.bumpButtons?.destroy()
    this.restartHint?.destroy()
  }
}
