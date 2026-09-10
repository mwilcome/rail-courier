# Screen: Play

## Behavior

- Path-locked chase: cart fixed lower-center; world scrolls toward player.
- OutDrive moodboard city (neon, striped sun energy).
- Lean warn on cart when tipping (mirrors tip side; junk tips with cart).
- Station strips: pass-through score; optional L/R fling at two side `station_drop_target`s for bonus (no cart arrow, no center fling button).
- Hazards: curves, joints, gusts.
- Touch pads L/R only (no center FLING).

## Lo-fi

```
+------------------------------------------+
| SCORE 840   x3                           |  <- HUD overlay
|                                          |
|     [towers]    SUN    [towers]          |
|        \         |         /             |
|   « [pkg]  ===rail===  [pkg] »           |  <- station strip: 2 side drop-targets
|          \               /               |
|           [====CART====]                 |
|              cargo                       |
|                                          |
|  [ L ]                            [ R ]  |
+------------------------------------------+
```

On station strips, L/R = fling only (lean paused); outside strip = lean bumps.
