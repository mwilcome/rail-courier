import Phaser from 'phaser'
import { lookFor, type Phase } from './cycle'
import { LEVEL } from './play'

const W = 960
const H = 540
const HORIZON = 390
const TOWERS = [70, 110, 50, 160, 90, 130, 40, 180, 75, 100, 145, 55, 170, 80, 120, 65, 150, 95, 40, 125]
const STARS = [40, 50, 90, 80, 140, 30, 200, 70, 260, 45, 310, 90, 400, 35, 520, 60, 580, 25, 640, 85, 700, 40, 820, 55, 880, 75]

/** City + sun/moon + grid + rails. Phase snap so the hour is readable at a glance. */
export class Sky {
  private readonly g: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.g = scene.add.graphics().setDepth(-20).setScrollFactor(0)
  }

  paint(phase: Phase): void {
    const look = lookFor(phase)
    const g = this.g
    g.clear()
    g.fillGradientStyle(look.skyTop, look.skyTop, look.skyBot, look.skyBot, 1)
    g.fillRect(0, 0, W, H)
    if (phase === 'night') {
      g.fillStyle(0xffffff, 0.75)
      for (let i = 0; i < STARS.length; i += 2) g.fillCircle(STARS[i], STARS[i + 1], 1.3)
    }
    star(g, look.star, look.starFill, look.starGlow, !look.moon)
    let x = 0
    for (const h of TOWERS) {
      g.fillStyle(look.city, 1)
      g.fillRect(x, HORIZON - h, 46, h)
      if (look.lit) {
        g.fillStyle(look.neon, 0.88)
        for (let yy = HORIZON - h + 10; yy < HORIZON - 12; yy += 16) {
          for (let xx = x + 8; xx < x + 40; xx += 12) {
            if ((xx + yy) % 5) g.fillRect(xx, yy, 5, 7)
          }
        }
      }
      x += 48
    }
    g.lineStyle(1, look.grid, 0.42)
    for (let i = 1; i <= 14; i++) {
      const y = HORIZON + ((i * i) / 14) * 150
      g.lineBetween(0, y, W, y)
    }
    for (let i = -16; i <= 16; i++) g.lineBetween(480 + i * 70, H, 480, HORIZON)
    for (const r of LEVEL.floor) {
      g.fillStyle(0x141018, 0.94)
      g.fillRect(r.x, r.y, r.width, r.height)
      g.lineStyle(3, look.rail, 1)
      g.lineBetween(r.x, r.y + 6, r.x + r.width, r.y + 6)
      g.lineBetween(r.x, r.y + r.height - 8, r.x + r.width, r.y + r.height - 8)
    }
    const pit = LEVEL.failZones[0]
    g.fillStyle(look.neon, 0.14)
    g.fillRect(pit.x, pit.y, pit.width, pit.height)
    const s = LEVEL.goal
    g.fillStyle(0x0a1620, 0.72)
    g.fillRect(s.x, s.y + 40, s.width, 40)
    g.lineStyle(3, look.neon, 1)
    g.strokeRect(s.x, s.y + 40, s.width, 40)
  }
}

function star(
  g: Phaser.GameObjects.Graphics,
  pose: readonly [number, number, number],
  fill: number,
  glow: number,
  striped: boolean,
): void {
  const [x, y, r] = pose
  g.fillStyle(glow, 0.2)
  g.fillCircle(x, y, r * 2)
  g.fillStyle(glow, 0.4)
  g.fillCircle(x, y, r * 1.35)
  g.fillStyle(fill, 1)
  if (!striped) {
    g.fillCircle(x, y, r)
    return
  }
  const band = (r * 2) / 10
  for (let i = 0; i < 10; i++) {
    if (i > 3 && i % 2 === 1) continue
    const y0 = y - r + i * band
    const cy = y0 + band / 2 - y
    const half = Math.sqrt(Math.max(0, r * r - cy * cy))
    g.fillRect(x - half, y0, half * 2, band * 0.85)
  }
}
