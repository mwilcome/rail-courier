import type Phaser from 'phaser';

/** Axis-aligned rect in world pixels. `x`/`y` are the top-left corner. */
export interface LevelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LevelPoint {
  x: number;
  y: number;
}

export interface WorldCollision {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface Slice0Level {
  worldBounds: LevelRect;
  /** Arcade world-bound sides that should block. Bottom stays open so a fall is a fail. */
  worldCollision: WorldCollision;
  playerSpawn: LevelPoint;
  floor: readonly LevelRect[];
  walls: readonly LevelRect[];
  goal: LevelRect;
  failZones: readonly LevelRect[];
}

export interface Slice0Placement {
  floor: Phaser.GameObjects.Rectangle[];
  walls: Phaser.GameObjects.Rectangle[];
  goal: Phaser.GameObjects.Rectangle;
  failZones: Phaser.GameObjects.Rectangle[];
}

export const SLICE0_COLORS = {
  floor: 0x4a5560,
  wall: 0x2d343c,
  goal: 0x3ecf6a,
  fail: 0xc23b3b,
} as const;

/** Slice 0: a short left-to-right rail with a mid-course pit and a goal pad. */
export const SLICE0: Slice0Level = {
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
};

export function centerOf(rect: LevelRect): LevelPoint {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function containsPoint(rect: LevelRect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export function isOutsideWorld(x: number, y: number, padding = 0): boolean {
  const b = SLICE0.worldBounds;
  return (
    x < b.x - padding ||
    y < b.y - padding ||
    x > b.x + b.width + padding ||
    y > b.y + b.height + padding
  );
}

export function isSlice0Fail(x: number, y: number): boolean {
  return isOutsideWorld(x, y) || SLICE0.failZones.some((zone) => containsPoint(zone, x, y));
}

export function isSlice0Goal(x: number, y: number): boolean {
  return containsPoint(SLICE0.goal, x, y);
}

export function applySlice0WorldBounds(scene: Phaser.Scene): void {
  const { x, y, width, height } = SLICE0.worldBounds;
  const { left, right, up, down } = SLICE0.worldCollision;
  scene.physics.world.setBounds(x, y, width, height, left, right, up, down);
}

/**
 * Draws slice 0 geometry and registers Arcade static bodies.
 * Floor/walls collide. Goal and fail zones are overlap sensors only.
 */
export function placeSlice0(scene: Phaser.Scene): Slice0Placement {
  applySlice0WorldBounds(scene);

  return {
    floor: SLICE0.floor.map((rect) => addStaticRect(scene, rect, SLICE0_COLORS.floor)),
    walls: SLICE0.walls.map((rect) => addStaticRect(scene, rect, SLICE0_COLORS.wall)),
    goal: addSensorRect(scene, SLICE0.goal, SLICE0_COLORS.goal, 0.85),
    failZones: SLICE0.failZones.map((rect) => addSensorRect(scene, rect, SLICE0_COLORS.fail, 0.45)),
  };
}

function addStaticRect(
  scene: Phaser.Scene,
  rect: LevelRect,
  color: number,
  alpha = 1,
): Phaser.GameObjects.Rectangle {
  const { x, y } = centerOf(rect);
  const obj = scene.add.rectangle(x, y, rect.width, rect.height, color, alpha);
  scene.physics.add.existing(obj, true);
  return obj;
}

function addSensorRect(
  scene: Phaser.Scene,
  rect: LevelRect,
  color: number,
  alpha = 1,
): Phaser.GameObjects.Rectangle {
  const obj = addStaticRect(scene, rect, color, alpha);
  const body = obj.body as Phaser.Physics.Arcade.StaticBody;
  body.checkCollision.none = true;
  return obj;
}
