# Audio

Locked for Phaser 3 (HTML5). Unlock playback after a user gesture. Separate **Music** and **SFX** mutes in Options.

## Music (`assets/audio/music/`)

| Key | Spec |
|-----|------|
| `music_play_loop` | Sped Nightcall-feel ~115 BPM instrumental night-drive synthwave; seamless **~3–4 min** loop that **repeats**; OutDrive neon energy; original only |
| `music_title_sting` | Colder same palette; **8–12 s**; **loops under Title/menu** until Play |

Formats: **OGG** primary + **MP3** fallback. Music bus only (Options Music mute).

## SFX (`assets/audio/sfx/`)

| Key | Max |
|-----|-----|
| `sfx_bump` | ≤0.15s |
| `sfx_lean_warn` | ≤0.2s |
| `sfx_fling` | ≤0.35s |
| `sfx_fling_hit` | ≤0.4s |
| `sfx_station_pass` | ≤0.3s |
| `sfx_spill_fail` | ≤0.8s |
| `sfx_ui_tap` | ≤0.1s |
| `sfx_buy` | ≤0.25s |
| `sfx_pause` | ≤0.15s |

Formats: OGG + MP3. SFX bus (Options SFX mute). Do not bake into music files.

## Owner

**Pulse** composes; **Mike** ships files into the repo.
