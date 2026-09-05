import { describe, expect, it } from 'vitest'
import {
  BUMP_IMPULSE,
  KNOCK_GAP_MS,
  KNOCK_IMPULSE,
  KNOCK_LEAN,
  LEAN_FAIL,
  LEAN_SAFE,
  LEVEL,
  PAYOUT,
  WOBBLE_AMP,
  advance,
  applyDeliver,
  bump,
  cargoLeftCart,
  dueKnock,
  freshRun,
  gameScale,
  isStation,
  rest,
  resultOf,
  shownLean,
  step,
  knock,
} from './play'

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
    let m = bump(bump(bump(rest(), 1), 1), 1)
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

  it('pit still resolves after lean is safe', () => {
    expect(resultOf(0, 620, 520)).toBe('fell')
  })
})

describe('station deliver', () => {
  const pad = { x: LEVEL.goal.x + 30, y: LEVEL.goal.y + 40 }

  it('delivers only with cargo aboard', () => {
    expect(resultOf(0, pad.x, pad.y, true)).toBe('deliver')
    expect(resultOf(0, pad.x, pad.y, false)).toBe('play')
    expect(applyDeliver({ cargo: false, payout: 3 }).payout).toBe(3)
  })

  it('payout increases and cargo reloads', () => {
    const once = applyDeliver(freshRun(), () => 0.5)
    expect(once.payout).toBe(PAYOUT)
    expect(once.cargo).toBe(true)
    expect(applyDeliver(once, () => 0.5).payout).toBe(PAYOUT * 2)
  })

  it('mild reset leaves the station so the run can continue', () => {
    const next = applyDeliver(freshRun(), () => 0.5)
    expect(isStation(next.x, next.y)).toBe(false)
    expect(resultOf(next.lean, next.x, next.y, next.cargo)).toBe('play')
    expect(Math.abs(next.lean)).toBeLessThan(0.12)
  })

  it('is a short hop from spawn, not a long lean slog', () => {
    const { x, y } = LEVEL.playerSpawn
    expect(isStation(x, y)).toBe(false)
    expect(isStation(x + 90, y)).toBe(true)
  })

  it('spill and fell still end the run, even on the pad', () => {
    expect(resultOf(LEAN_FAIL + 0.01, pad.x, pad.y, true)).toBe('spill')
    expect(resultOf(0, 620, 520, true)).toBe('fell')
    expect(resultOf(LEAN_FAIL + 0.01, pad.x, pad.y, true)).not.toBe('deliver')
  })
})

describe('track knocks', () => {
  it('worsens lean without a bump or any vx', () => {
    const start = { ...rest(), lean: 0.28 }
    const kicked = knock(start)
    expect(kicked.vx).toBe(0)
    expect(kicked.lean).toBeCloseTo(start.lean + KNOCK_LEAN)
    expect(kicked.leanVel).toBe(KNOCK_IMPULSE)
    expect(peakLean(kicked)).toBeGreaterThan(start.lean)
    expect(peakLean(kicked)).toBeGreaterThan(peakLean(start))
  })

  it('fires once at the gap, not as a hold-steer force between knocks', () => {
    expect(dueKnock(0, 16)).toBe(false)
    expect(dueKnock(KNOCK_GAP_MS - 8, KNOCK_GAP_MS + 8)).toBe(true)
    expect(dueKnock(KNOCK_GAP_MS + 8, KNOCK_GAP_MS + 24)).toBe(false)

    const leaned = { ...rest(), lean: 0.2 }
    const { motion: atKnock } = advance(leaned, 16, KNOCK_GAP_MS - 8)
    expect(atKnock.vx).toBe(0)
    expect(atKnock.leanVel).toBeGreaterThan(leaned.leanVel)

    const { motion: coast } = advance(atKnock, 16, KNOCK_GAP_MS + 8)
    expect(coast.leanVel).toBeLessThan(atKnock.leanVel)
  })

  it('can push lean across the fail threshold without extra bumps', () => {
    const oneBump = bump(rest(), 1)
    expect(peakLean(oneBump)).toBeLessThan(LEAN_FAIL)

    let m = knock(oneBump)
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
  })
})

describe('idle wobble', () => {
  it('is present between knocks and stays small', () => {
    let m = rest()
    let age = 0
    const samples: number[] = []
    for (let i = 0; i < 70; i++) {
      const next = advance(m, 16, age)
      m = next.motion
      age = next.age
      samples.push(shownLean(m.lean, age))
    }
    expect(age).toBeLessThan(KNOCK_GAP_MS)
    expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(WOBBLE_AMP)
    expect(Math.max(...samples.map(Math.abs))).toBeLessThan(LEAN_SAFE)
    expect(m.vx).toBe(0)
    expect(Math.abs(m.lean)).toBeLessThan(0.02)
  })
})

describe('mobile scale', () => {
  it('selects Phaser FIT + CENTER_BOTH at 960×540', () => {
    expect(gameScale({ FIT: 3, CENTER_BOTH: 1 })).toEqual({
      mode: 3,
      autoCenter: 1,
      width: 960,
      height: 540,
    })
  })
})
