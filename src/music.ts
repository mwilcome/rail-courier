import { trackFor, type Phase } from './cycle'

/** Tiny procedural loop. Track data lives in cycle.ts — this is just Web Audio. */
export class PhaseMusic {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private phase: Phase = 'dawn'
  private step = 0
  private timer = 0

  setPhase(phase: Phase): void {
    this.phase = phase
  }

  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.07
      this.master.connect(this.ctx.destination)
      this.pulse()
    }
    void this.ctx.resume()
  }

  stop(): void {
    window.clearTimeout(this.timer)
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }

  private pulse = (): void => {
    const track = trackFor(this.phase)
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime
      const i = this.step % track.steps.length
      tone(this.ctx, this.master, track.bass * 2 ** (track.steps[i] / 12), track.wave, now, 0.1)
      if (i === 0) tone(this.ctx, this.master, track.bass / 2, 'sine', now, 0.18)
      this.step++
    }
    this.timer = window.setTimeout(this.pulse, 30000 / track.bpm)
  }
}

function tone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  type: OscillatorType,
  when: number,
  dur: number,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, when)
  gain.gain.setValueAtTime(0.001, when)
  gain.gain.exponentialRampToValueAtTime(0.22, when + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur)
  osc.connect(gain)
  gain.connect(dest)
  osc.start(when)
  osc.stop(when + dur + 0.02)
}
