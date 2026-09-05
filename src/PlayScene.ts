import Phaser from 'phaser'
import { Cart } from './cart'
import { bindBumpInput } from './input'
import { LEVEL, resultOf } from './play'

export class PlayScene extends Phaser.Scene {
  private cart!: Cart
  private unbindInput?: () => void
  private restartKey?: Phaser.Input.Keyboard.Key
  private ended = false

  constructor() {
    super({ key: 'PlayScene' })
  }

  create(): void {
    const { floor, walls } = drawLevel(this)
    this.cart = new Cart(this, LEVEL.playerSpawn.x, LEVEL.playerSpawn.y)
    this.physics.add.collider(this.cart.hull, floor)
    this.physics.add.collider(this.cart.hull, walls)
    this.unbindInput = bindBumpInput(this, this.cart)
    this.restartKey = this.input.keyboard?.addKey('R', true)
    this.restartKey?.on('down', this.restart, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
  }

  update(_t: number, delta: number): void {
    if (this.ended) return
    this.cart.update(delta)
    const result = resultOf(this.cart.lean, this.cart.hull.x, this.cart.hull.y)
    if (result === 'spill') this.endSpill()
    else if (result === 'fell') this.endFell()
    else if (result === 'goal') {
      this.ended = true
      this.cart.lock()
      this.time.delayedCall(400, this.restart, [], this)
    }
  }

  private endSpill(): void {
    this.ended = true
    this.cart.lock()
    this.cart.spill()
    this.showResult('SPILLED\ncargo run over\ntap or press R')
  }

  private endFell(): void {
    this.ended = true
    this.cart.lock()
    this.showResult('FELL\ntap or press R')
  }

  private showResult(message: string): void {
    const { width: w, height: h } = this.scale
    this.add
      .rectangle(w / 2, h / 2, w, h, 0x000000, 0.5)
      .setScrollFactor(0)
      .setDepth(1100)
      .setInteractive()
      .on('pointerdown', this.restart)
    this.add
      .text(w / 2, h / 2, message, { fontFamily: 'sans-serif', fontSize: '28px', color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1101)
  }

  private restart = (): void => {
    this.scene.restart()
  }

  private cleanup = (): void => {
    this.restartKey?.off('down', this.restart, this)
    this.unbindInput?.()
  }
}

function drawLevel(scene: Phaser.Scene): { floor: Phaser.GameObjects.Rectangle[]; walls: Phaser.GameObjects.Rectangle[] } {
  const { x, y, width, height } = LEVEL.worldBounds
  const c = LEVEL.worldCollision
  scene.physics.world.setBounds(x, y, width, height, c.left, c.right, c.up, c.down)
  const box = (r: { x: number; y: number; width: number; height: number }, color: number, alpha = 1, sensor = false) => {
    const obj = scene.add.rectangle(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height, color, alpha)
    scene.physics.add.existing(obj, true)
    if (sensor) (obj.body as Phaser.Physics.Arcade.StaticBody).checkCollision.none = true
    return obj
  }
  LEVEL.failZones.forEach((r) => box(r, 0xc23b3b, 0.45, true))
  box(LEVEL.goal, 0x3ecf6a, 0.85, true)
  return {
    floor: LEVEL.floor.map((r) => box(r, 0x4a5560)),
    walls: LEVEL.walls.map((r) => box(r, 0x2d343c)),
  }
}
