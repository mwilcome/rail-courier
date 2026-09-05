/** Phaser scale keys. `gameScale()` is what config.ts must pass to Phaser. */
export const SCALE = { mode: 'FIT', autoCenter: 'CENTER_BOTH', width: 960, height: 540 } as const

export function gameScale(Scale: { FIT: number; CENTER_BOTH: number }): {
  mode: number
  autoCenter: number
  width: number
  height: number
} {
  return {
    mode: Scale[SCALE.mode],
    autoCenter: Scale[SCALE.autoCenter],
    width: SCALE.width,
    height: SCALE.height,
  }
}

/** One-shot horizontal delta-v (px/s). Applied only when bump() is called. */
export const BUMP_IMPULSE = 280
export const LEAN_SAFE = 0.42
export const LEAN_FAIL = 1.05

const LEAN_FROM_BUMP = 2.45
const LEAN_FROM_VX = 0.0024
const LEAN_SPRING = 5
const LEAN_DAMP = 1.6

/** Spaced track knock: leanVel kick only. No vx — not a player bump. */
export const KNOCK_IMPULSE = 1.7
export const KNOCK_GAP_MS = 1400
export const WOBBLE_AMP = 0.18
export const WOBBLE_MS = 880

export type Motion = { vx: number; lean: number; leanVel: number }
export type RunResult = 'play' | 'spill' | 'fell' | 'goal'

export const LEVEL = {
  worldBounds: { x: 0, y: 0, width: 960, height: 540 },
  worldCollision: { left: true, right: true, up: true, down: false },
  playerSpawn: { x: 120, y: 460 },
  floor: [
    { x: 20, y: 500, width: 520, height: 40 },
    { x: 700, y: 500, width: 240, height: 40 },
  ],
  walls: [
    { x: 0, y: 0, width: 20, height: 540 },
    { x: 940, y: 0, width: 20, height: 540 },
    { x: 20, y: 0, width: 920, height: 20 },
  ],
  goal: { x: 848, y: 420, width: 64, height: 80 },
  failZones: [
    { x: 540, y: 500, width: 160, height: 40 },
    { x: 0, y: 540, width: 960, height: 80 },
  ],
} as const

export const rest = (): Motion => ({ vx: 0, lean: 0, leanVel: 0 })

/** Discrete impulse. Calling this is a press; stepping time does not add more vx. */
export function bump(m: Motion, dir: -1 | 1): Motion {
  return { vx: m.vx + dir * BUMP_IMPULSE, lean: m.lean, leanVel: m.leanVel + dir * LEAN_FROM_BUMP }
}

/** Underdamped lean. Not clamped to LEAN_SAFE — momentum can overshoot and fail. */
export function step(m: Motion, dtMs: number): Motion {
  const dt = Math.min(dtMs / 1000, 0.05)
  const leanVel = m.leanVel + (m.vx * LEAN_FROM_VX - m.lean * LEAN_SPRING - m.leanVel * LEAN_DAMP) * dt
  return { vx: m.vx, lean: m.lean + leanVel * dt, leanVel }
}

/** Discrete knock. Pushes further from upright so lean can walk toward spill. */
export function knock(m: Motion): Motion {
  const dir = m.lean < 0 ? -1 : 1
  return { vx: m.vx, lean: m.lean, leanVel: m.leanVel + dir * KNOCK_IMPULSE }
}

export function idleWobble(ageMs: number): number {
  return Math.sin((ageMs / WOBBLE_MS) * Math.PI * 2) * WOBBLE_AMP
}

export function shownLean(lean: number, ageMs: number): number {
  return lean + idleWobble(ageMs)
}

export function dueKnock(beforeMs: number, afterMs: number): boolean {
  return Math.floor(afterMs / KNOCK_GAP_MS) > Math.floor(beforeMs / KNOCK_GAP_MS)
}

/** One frame of play: optional spaced knock, then lean step. Wobble is display-only. */
export function advance(m: Motion, dtMs: number, ageMs: number): { motion: Motion; age: number } {
  const age = ageMs + dtMs
  return { motion: step(dueKnock(ageMs, age) ? knock(m) : m, dtMs), age }
}

export function cargoLeftCart(lean: number): boolean {
  return Math.abs(lean) > LEAN_FAIL
}

export function resultOf(lean: number, x: number, y: number): RunResult {
  if (cargoLeftCart(lean)) return 'spill'
  if (isFail(x, y)) return 'fell'
  if (isGoal(x, y)) return 'goal'
  return 'play'
}

export function isFail(x: number, y: number): boolean {
  const b = LEVEL.worldBounds
  return x < b.x || y < b.y || x > b.x + b.width || y > b.y + b.height || LEVEL.failZones.some((z) => hit(z, x, y))
}

export function isGoal(x: number, y: number): boolean {
  return hit(LEVEL.goal, x, y)
}

function hit(r: { x: number; y: number; width: number; height: number }, x: number, y: number): boolean {
  return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
}
