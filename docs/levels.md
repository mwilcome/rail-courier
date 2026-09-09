# Levels (plugins)

A **level** is a full setting (city monorail, later beach monorail, etc.) — not a tint/skin swap.

## Contract

Shared forever: cart, bumps, lean/spill, stations, fling, hazards API, UI, garage.

Each level is a **plugin folder** that registers:

- `id` (e.g. `city-monorail`)
- parallax / world art set (own props, towers, rail look)
- palette / lighting cues
- hazard timeline (where curves / joints / gusts fire)
- station spacing / bay layout
- music cue

Core loop code loads by `id`. Adding a beach level = new folder that registers itself — **zero** rewrite of cart/UI/garage.

## Shipping now

Ship **one** plugin: city monorail (OutDrive moodboard neon city).

Later plugins (beach, Gulf desert, rainy night, etc.) drop in under the same API.
