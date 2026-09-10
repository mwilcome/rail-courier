# Gameplay

Terms used once here, then reused:

- **Path-locked chase camera** — cart stays glued to a fixed spot on the screen; the world scrolls toward you on a set rail path. No free camera, no cinematic slides.
- **Lean** — how tipped the cargo is. Too far = spill.
- **Bump** — one discrete left/right impulse (not hold-to-steer, not gyro).
- **Station** — neon stop you pass on the rail.
- **Bank** — score currency saved between runs (localStorage).
- **station_drop_target** — fat package-slot icon on a station bay (L cyan / R magenta). Replaces any cart fling arrow.

## Core loop

1. Start from Title → Play (city monorail level plugin).
2. Ride forward; world scrolls at you.
3. Bump L/R to manage lean; spill = Fail.
4. Pass stations: base score if balanced (pass-through). Optional fling bonus.
5. Hazards (curves, joints, gusts) push lean — recover or spill.
6. On Fail: Restart, Title, or Unlocks.
7. Between runs: spend bank in Unlocks garage; upgrades persist.

## Controls

| Input | Action |
|-------|--------|
| ← / → or A / D | Discrete bump left / right (**outside** station strip) |
| On-screen L / R pads | Same as keyboard |
| L / R **in** station strip | Fling left / right at the matching side `station_drop_target` (**lean paused** for the strip) |

**Dual-use (locked):** outside strip = lean bumps; in strip = fling only. No center fling button. No Space-as-fling. No gyro / tilt.

Remapping: not in the finished game (defaults only).

## Camera

Old-arcade path lock: cart fixed in a lower-center screen slot. Predetermined ribbon; world scrolls/scales toward the player. Modern Phaser implementation, cabinet feel.

## Lean / spill

- Bumps add lean velocity; lean springs back over time (Gyro dampers upgrade speeds return).
- Spill past fail threshold → Fail screen.
- Lean warn: small tip chevron **on the cart**, mirrors tip side; cargo/junk tip in place with the cart (not a rigid stack). Path-lock unchanged (rotation in place, not camera move).
- Station fling uses **station** cues only — lean warn may stay on cart (no competing cart arrow).

## Stations + score

- **Pass-through auto-deliver:** stay balanced through the gate → base score (+ streak).
- Spill in gate → fail, no score for that station.
- **Fling bonus (same camera):** on a long station strip, **two side drop-targets** light up (L cyan / R magenta package-slot + « »). Center bay is pass-through only — not a fling target. L/R inputs fling toward the matching target (lean paused). Skill = learn which side + speed + timing. Hit = bonus; miss = no bonus; run continues.
- Assets: `station_drop_target` (per side). **Killed:** `cue_fling_arrow`, center `btn_fling`.
- **Streak:** consecutive successful station passes without spill; multiplies payout.
- **Payday** upgrade: more score per station.
- **Station magnet** upgrade: wider deliver gate.

## Hazards (track timeline events)

All are markers on the path (distance X → effect). One handler, different event types:

1. **Track joints** — periodic small lean impulse
2. **Curve lean** — while in a bend, constant lean bias toward outside
3. **Side gusts** — rarer one-shot lateral impulse (telegraphed in art)

**Rail sync** upgrade softens joints/gusts.

## Economy / meta

- Score during run; on fail/end, add to **bank** (localStorage).
- Unlocks garage: six bars, max level **5** each, bought with bank.
- No mid-run shopping.

### Garage bars

| Stat | Effect |
|------|--------|
| Chassis | Wider safe lean |
| Mag-locks | Cargo sticks harder |
| Rail sync | Softer track knocks |
| Gyro dampers | Returns to center faster |
| Station magnet | Easier delivers (wider gate) |
| Payday | More score per station |

Parked for later (not in this build unless Mike reopens): Afterburn, Spare crate, cosmetics, share-score.

## Run length

Open until spill. Difficulty ramps so early deaths can land ~30s; strong runs land about **1–3 minutes**; hard runs compound around **~5 min**. No hard timer.

## Audio

Separate **music** and **SFX** mutes in Options. Unlock audio after a user gesture (browser rule). Full keys/lengths: [audio.md](audio.md).

## Persist

Bank + garage levels + high score → **localStorage only**. No accounts.
