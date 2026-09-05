import { describe, expect, it } from 'vitest'
import { BUMP_IMPULSE, LEAN_FAIL, LEAN_SAFE, LEVEL, bump, cargoLeftCart, gameScale, rest, resultOf, step } from './play'

function peakLean(start: ReturnType<typeof rest>, frames = 120, dt = 16): number {
  let m = start
  let peak = Math.abs(m.lean)
  for (let i = 0; i < frames; i++) {
    m = step(m, dt)
    peak = Math.max(peak, Math.abs(m.lean))
  }
  return peak
}

describe('bump impulse', () => {
  it('applies one-shot delta-v; stepping time does not add another impulse', () => {
    const once = bump(rest(), 1)
    expect(once.vx).toBe(BUMP_IMPULSE)
    expect(once.leanVel).toBeGreaterThan(0)

    const later = step(once, 1000)
    expect(later.vx).toBe(BUMP_IMPULSE)

    const twice = bump(once, 1)
    expect(twice.vx).toBe(BUMP_IMPULSE * 2)
    expect(twice.leanVel).toBe(once.leanVel * 2)
  })

  it('left bump is the opposite one-shot of right', () => {
    expect(bump(rest(), -1).vx).toBe(-BUMP_IMPULSE)
  })
})

describe('lean overshoot', () => {
  it('one bump can carry lean past safe — not clamped to the safe band', () => {
    const peak = peakLean(bump(rest(), 1))
    expect(peak).toBeGreaterThan(LEAN_SAFE)
    expect(peak).toBeLessThan(LEAN_FAIL)
  })

  it('stacked bumps let momentum cross the fail threshold (spill, not a late clamp)', () => {
    let m = bump(bump(rest(), 1), 1)
    const { x, y } = LEVEL.playerSpawn
    let worst: ReturnType<typeof resultOf> = 'play'
    let peak = 0
    for (let i = 0; i < 90; i++) {
      m = step(m, 16)
      peak = Math.max(peak, Math.abs(m.lean))
      if (worst === 'play') worst = resultOf(m.lean, x, y)
    }
    expect(peak).toBeGreaterThan(LEAN_FAIL)
    expect(worst).toBe('spill')
    expect(cargoLeftCart(peak)).toBe(true)
  })
})

describe('leave cart / spill result', () => {
  it('lean past fail is a spill even on the spawn pad', () => {
    const { x, y } = LEVEL.playerSpawn
    expect(resultOf(LEAN_FAIL + 0.01, x, y)).toBe('spill')
    expect(resultOf(0, x, y)).toBe('play')
  })

  it('pit and goal still resolve after lean is safe', () => {
    expect(resultOf(0, 320, 485)).toBe('fell')
    expect(resultOf(0, 560, 430)).toBe('goal')
  })
})

describe('mobile scale', () => {
  it('selects Phaser FIT + CENTER_BOTH at 640×640', () => {
    expect(gameScale({ FIT: 3, CENTER_BOTH: 1 })).toEqual({
      mode: 3,
      autoCenter: 1,
      width: 640,
      height: 640,
    })
  })
})
