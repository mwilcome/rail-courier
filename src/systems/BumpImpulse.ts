import type Phaser from 'phaser'

/** Horizontal delta-v applied once per call, in pixels/second. */
export const BUMP_IMPULSE = 280

/** One-shot left impulse. No acceleration / no hold continuum. */
export function bumpLeft(body: Phaser.Physics.Arcade.Body): void {
  body.setVelocityX(body.velocity.x - BUMP_IMPULSE)
}

/** One-shot right impulse. No acceleration / no hold continuum. */
export function bumpRight(body: Phaser.Physics.Arcade.Body): void {
  body.setVelocityX(body.velocity.x + BUMP_IMPULSE)
}
