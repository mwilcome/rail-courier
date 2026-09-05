import Phaser from 'phaser'

/** Horizontal delta-v applied once per bump, in pixels/second. */
export const BUMP_IMPULSE = 280

/** Angular-velocity kick from one bump (rad/s). Stacks; not a hold force. */
const LEAN_FROM_BUMP = 2.45

/** Lean pulled by current lateral speed — coupling, not a control axis. */
const LEAN_FROM_VX = 0.0024

/** Restoring spring. Underdamped on purpose so lean overshoots. */
const LEAN_SPRING = 9

/** Light damping. Below 2*sqrt(spring) so momentum carries past center/safe. */
const LEAN_DAMP = 2.4

/** Past this, cargo is visibly past a comfortable sit (warning tint). */
export const LEAN_SAFE = 0.42

/** Past this, cargo has left the cart. */
export const LEAN_FAIL = 1.05

const CARGO_ARM = 26
const CARGO_COLOR = 0x5ce1e6
const CARGO_WARN = 0xffd166
const CARGO_SPILL = 0xc23b3b

/**
 * Cart hull + cargo lean. One impulse path: bumpLeft/bumpRight.
 * Lean is a spring-damper with momentum — not clamped to the safe band.
 */
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
    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error('Cart expected a dynamic Arcade body')
    }

    this.body = body
    this.body.setCollideWorldBounds(true)
    this.body.setDragX(500)
    this.body.setMaxVelocity(640, 2000)

    this.cargo = scene.add.rectangle(x, y - CARGO_ARM, 24, 24, CARGO_COLOR).setDepth(1)
    this.placeCargo()
  }

  bumpLeft(): void {
    this.bump(-1)
  }

  bumpRight(): void {
    this.bump(1)
  }

  update(dtMs: number): void {
    if (this.locked || this.spilled) {
      return
    }

    const dt = Math.min(dtMs / 1000, 0.05)
    const drive = this.body.velocity.x * LEAN_FROM_VX
    const spring = -this.lean * LEAN_SPRING
    const damp = -this.leanVel * LEAN_DAMP

    this.leanVel += (drive + spring + damp) * dt
    this.lean += this.leanVel * dt

    this.placeCargo()
    this.tintCargo()
  }

  hasLeftCart(): boolean {
    return Math.abs(this.lean) > LEAN_FAIL
  }

  /** Drop cargo off the deck — spill / run-over. */
  spill(): void {
    if (this.spilled) {
      return
    }

    this.spilled = true
    this.cargo.setFillStyle(CARGO_SPILL)
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

  private bump(dir: 1 | -1): void {
    if (this.locked || this.spilled) {
      return
    }

    this.body.setVelocityX(this.body.velocity.x + dir * BUMP_IMPULSE)
    this.leanVel += dir * LEAN_FROM_BUMP
  }

  private placeCargo(): void {
    const { x, y } = this.hull
    this.cargo.setPosition(x + Math.sin(this.lean) * CARGO_ARM, y - 4 - Math.cos(this.lean) * CARGO_ARM)
    this.cargo.setRotation(this.lean)
  }

  private tintCargo(): void {
    this.cargo.setFillStyle(Math.abs(this.lean) > LEAN_SAFE ? CARGO_WARN : CARGO_COLOR)
  }
}
