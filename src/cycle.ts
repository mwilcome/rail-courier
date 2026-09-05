/** Looping day cycle + the look/track each phase maps to. No Phaser. */

export const PHASES = ['dawn', 'day', 'dusk', 'night'] as const
export type Phase = (typeof PHASES)[number]

/** Long enough to read at a glance; short enough to loop in one playtest. */
export const PHASE_MS = 8000
const LOOP_MS = PHASE_MS * PHASES.length

export type Track = {
  bpm: number
  wave: OscillatorType
  bass: number
  steps: readonly number[]
}

export type Look = {
  skyTop: number
  skyBot: number
  starFill: number
  starGlow: number
  star: readonly [x: number, y: number, r: number]
  city: number
  neon: number
  grid: number
  rail: number
  lit: boolean
  moon: boolean
}

export const TRACK: Record<Phase, Track> = {
  dawn: { bpm: 86, wave: 'triangle', bass: 110, steps: [0, 7, 12, 7] },
  day: { bpm: 120, wave: 'square', bass: 146.83, steps: [0, 4, 7, 12] },
  dusk: { bpm: 100, wave: 'sawtooth', bass: 123.47, steps: [0, 5, 8, 5] },
  night: { bpm: 72, wave: 'triangle', bass: 87.31, steps: [0, 3, 7, 10] },
}

export const LOOK: Record<Phase, Look> = {
  dawn: {
    skyTop: 0x7a2f6b,
    skyBot: 0xffb08a,
    starFill: 0xffe08a,
    starGlow: 0xff7a4a,
    star: [170, 292, 54],
    city: 0x1c1028,
    neon: 0xff6b9d,
    grid: 0xff8fa3,
    rail: 0xff7b6b,
    lit: false,
    moon: false,
  },
  day: {
    skyTop: 0x3d1b7a,
    skyBot: 0xff5eb5,
    starFill: 0xfff1a8,
    starGlow: 0xffc857,
    star: [480, 132, 66],
    city: 0x160c32,
    neon: 0x2de2e6,
    grid: 0xff71ce,
    rail: 0x2de2e6,
    lit: false,
    moon: false,
  },
  dusk: {
    skyTop: 0x1a0838,
    skyBot: 0xff4d1c,
    starFill: 0xff8a2a,
    starGlow: 0xff3d00,
    star: [800, 278, 58],
    city: 0x100618,
    neon: 0xff2d95,
    grid: 0xff6b35,
    rail: 0xff2d95,
    lit: true,
    moon: false,
  },
  night: {
    skyTop: 0x04010c,
    skyBot: 0x1a0a48,
    starFill: 0xe8e4ff,
    starGlow: 0x8ab4ff,
    star: [760, 108, 28],
    city: 0x080410,
    neon: 0x00f5d4,
    grid: 0x7b2cbf,
    rail: 0x00f5d4,
    lit: true,
    moon: true,
  },
}

export function phaseAt(ms: number): Phase {
  const t = ((ms % LOOP_MS) + LOOP_MS) % LOOP_MS
  return PHASES[Math.floor(t / PHASE_MS)]
}

export const trackFor = (phase: Phase): Track => TRACK[phase]
export const lookFor = (phase: Phase): Look => LOOK[phase]
export const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`
