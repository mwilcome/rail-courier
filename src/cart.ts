import Phaser from 'phaser'
import { LEAN_SAFE, bump, cargoLeftCart, step, type Motion } from './play'

const ARM = 26
const OK = 0x5ce1e6
const WARN = 0xffd166
const SPILL = 0xc23b3b

export class Cart {
  readonly hull: Phaser.GameObjects.Rectangle
  readonly cargo: Phaser.GameObjects.Rectangle
  readonly body: Phaser.Physics.Arcade.Body
  lean = 0
  leanVel = 0
  locked = false
  spilled = false

  private readonly scene: Phaser.Scene

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.hull = scene.add.rectangle(x, y, 52, 26, 0xff6b35)
    scene.physics.add.existing(this.hull)
    const body = this.hull.body
    if (!(body instanceof Phaser.Physics.Arcade.Body)) throw new Error('Cart needs a dynamic body')
    this.body = body
    this.body.setCollideWorldBounds(true)
    this.body.setDragX(500)
    this.body.setMaxVelocity(640, 2000)
    this.cargo = scene.add.rectangle(x, y - ARM, 24, 24, OK).setDepth(1)
    this.drawCargo()
  }

  bumpLeft(): void {
    this.apply(-1)
  }

  bumpRight(): void {
    this.apply(1)
  }

  update(dtMs: number): void {
    if (this.locked || this.spilled) return
    const next = step(this.motion(), dtMs)
    this.lean = next.lean
    this.leanVel = next.leanVel
    this.drawCargo()
  }

  hasLeftCart(): boolean {
    return cargoLeftCart(this.lean)
  }

  spill(): void {
    if (this.spilled) return
    this.spilled = true
    this.cargo.setFillStyle(SPILL)
    const side = this.lean === 0 ? 1 : Math.sign(this.lean)
    this.scene.tweens.add({
      targets: this.cargo,
      x: this.cargo.x + side * 72,
      y: this.cargo.y + 92,
      angle: this.cargo.angle + side * 130,
      duration: 380,
      ease: 'Quad.easeIn',
    })
  }

  lock(): void {
    this.locked = true
    this.body.setVelocity(0, 0)
    this.body.enable = false
  }

  private apply(dir: -1 | 1): void {
    if (this.locked || this.spilled) return
    const next = bump(this.motion(), dir)
    this.body.setVelocityX(next.vx)
    this.leanVel = next.leanVel
  }

  private motion(): Motion {
    return { vx: this.body.velocity.x, lean: this.lean, leanVel: this.leanVel }
  }

  private drawCargo(): void {
    const { x, y } = this.hull
    this.cargo.setPosition(x + Math.sin(this.lean) * ARM, y - 4 - Math.cos(this.lean) * ARM)
    this.cargo.setRotation(this.lean)
    this.cargo.setFillStyle(Math.abs(this.lean) > LEAN_SAFE ? WARN : OK)
  }
}
