import type Phaser from 'phaser'

/** Axis-aligned rect in world pixels. `x`/`y` are the top-left corner. */
export interface LevelRect {
  x: number
  y: number
  width: number
  height: number
}

export interface LevelPoint {
  x: number
  y: number
}

export const LEVEL = {
  worldBounds: { x: 0, y: 0, width: 960, height: 540 },
  /** Bottom open so a fall is a fail. */
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

const COLORS = {
  floor: 0x4a5560,
  wall: 0x2d343c,
  goal: 0x3ecf6a,
  fail: 0xc23b3b,
} as const

export function isFail(x: number, y: number): boolean {
  const b = LEVEL.worldBounds
  const outside = x < b.x || y < b.y || x > b.x + b.width || y > b.y + b.height
  return outside || LEVEL.failZones.some((zone) => contains(zone, x, y))
}

export function isGoal(x: number, y: number): boolean {
  return contains(LEVEL.goal, x, y)
}

export function placeLevel(scene: Phaser.Scene): {
  floor: Phaser.GameObjects.Rectangle[]
  walls: Phaser.GameObjects.Rectangle[]
} {
  const { x, y, width, height } = LEVEL.worldBounds
  const { left, right, up, down } = LEVEL.worldCollision
  scene.physics.world.setBounds(x, y, width, height, left, right, up, down)

  LEVEL.failZones.forEach((rect) => addRect(scene, rect, COLORS.fail, 0.45, true))
  addRect(scene, LEVEL.goal, COLORS.goal, 0.85, true)

  return {
    floor: LEVEL.floor.map((rect) => addRect(scene, rect, COLORS.floor)),
    walls: LEVEL.walls.map((rect) => addRect(scene, rect, COLORS.wall)),
  }
}

function contains(rect: LevelRect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
}

function addRect(
  scene: Phaser.Scene,
  rect: LevelRect,
  color: number,
  alpha = 1,
  sensor = false,
): Phaser.GameObjects.Rectangle {
  const obj = scene.add.rectangle(
    rect.x + rect.width / 2,
    rect.y + rect.height / 2,
    rect.width,
    rect.height,
    color,
    alpha,
  )
  scene.physics.add.existing(obj, true)
  if (sensor) {
    ;(obj.body as Phaser.Physics.Arcade.StaticBody).checkCollision.none = true
  }
  return obj
}
