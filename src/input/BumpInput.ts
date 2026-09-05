import type Phaser from 'phaser';

/** John's bump impulse API. */
export interface BumpApi {
  bumpLeft(): void;
  bumpRight(): void;
}

/**
 * Stub until John lands the real bumpLeft() / bumpRight() API.
 * Callers can pass his object once it exists.
 */
export function bumpLeft(): void {
  console.log('[stub] bumpLeft()');
}

export function bumpRight(): void {
  console.log('[stub] bumpRight()');
}

export const STUB_BUMP_API: BumpApi = { bumpLeft, bumpRight };

/**
 * Discrete left/right keyboard bumps. One impulse per key press.
 * Hold does not repeat.
 */
export class BumpInput {
  private readonly left: Phaser.Input.Keyboard.Key | undefined;
  private readonly right: Phaser.Input.Keyboard.Key | undefined;
  private readonly onLeft: () => void;
  private readonly onRight: () => void;

  constructor(scene: Phaser.Scene, api: BumpApi = STUB_BUMP_API) {
    const keyboard = scene.input.keyboard;
    this.onLeft = () => api.bumpLeft();
    this.onRight = () => api.bumpRight();

    if (!keyboard) {
      return;
    }

    this.left = keyboard.addKey('LEFT', true);
    this.right = keyboard.addKey('RIGHT', true);
    this.left.on('down', this.onLeft);
    this.right.on('down', this.onRight);
  }

  destroy(): void {
    this.left?.off('down', this.onLeft);
    this.right?.off('down', this.onRight);
  }
}

export function createBumpInput(scene: Phaser.Scene, api?: BumpApi): BumpInput {
  return new BumpInput(scene, api);
}
