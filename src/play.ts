/** Square + FIT: same playfield on phone/desktop, portrait or landscape. */
export const SCALE = { mode: 'FIT', autoCenter: 'CENTER_BOTH', width: 640, height: 640 } as const

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
export const LEAN_SAFE = 0.32
export const LEAN_FAIL = 0.88

const LEAN_FROM_BUMP = 2.05
const LEAN_FROM_VX = 0.0024
const LEAN_SPRING = 5
const LEAN_DAMP = 1.6

export type Motion = { vx: number; lean: number; leanVel: number }
export type RunResult = 'play' | 'spill' | 'fell' | 'goal'

export const LEVEL = {
  worldBounds: { x: 0, y: 0, width: SCALE.width, height: SCALE.height },
  worldCollision: { left: true, right: true, up: true, down: false },
  playerSpawn: { x: 88, y: 430 },
  floor: [
    { x: 16, y: 470, width: 260, height: 32 },
    { x: 384, y: 470, width: 240, height: 32 },
  ],
  walls: [
    { x: 0, y: 0, width: 16, height: 640 },
    { x: 624, y: 0, width: 16, height: 640 },
    { x: 16, y: 0, width: 608, height: 16 },
  ],
  goal: { x: 536, y: 390, width: 56, height: 80 },
  failZones: [
    { x: 276, y: 470, width: 108, height: 32 },
    { x: 0, y: 640, width: 640, height: 80 },
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
