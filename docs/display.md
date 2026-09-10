# Display / assets

Locked for Phaser 3 + Vite + TypeScript. Mobile portrait and website embed — **never force landscape**.

## Canvas + scale

| Setting | Lock |
|---------|------|
| Design canvas | **720×720** square |
| Scale mode | `Phaser.Scale.FIT` + center (letterbox on non-square hosts; arcade.gov-style) |
| Orientation | Portrait phone + desktop page embed OK — no landscape lock |

## Atlases

| Setting | Lock |
|---------|------|
| Max atlas size | **2048×2048** per sheet (mobile-safe WebGL) |
| Packs | `atlas_city` (level/world) + `atlas_ui` (HUD/menus/garage) |
| Art scale | **1×** for the 720 design space — no separate @2x set |

## Touch

- L/R pads ≥ **44px** hit targets (see [touch-pads.md](screens/touch-pads.md))
- No PPI lock — browser / Phaser handle device pixel ratio

## Killed

- Landscape-only canvas (e.g. 1280×720)
- Forcing device rotation
