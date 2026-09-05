import type Phaser from 'phaser';

export interface RestartHintOptions {
  message?: string;
  depth?: number;
}

const DEFAULT_MESSAGE = 'Press R to restart';
const DEFAULT_DEPTH = 1000;

/** Overlay shown by a scene on fail. Does not listen for input. */
export class RestartHint {
  private readonly overlay: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private visible = false;

  constructor(scene: Phaser.Scene, options: RestartHintOptions = {}) {
    const message = options.message ?? DEFAULT_MESSAGE;
    const depth = options.depth ?? DEFAULT_DEPTH;
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.overlay = scene.add
      .rectangle(cx, cy, width, height, 0x000000, 0.45)
      .setScrollFactor(0)
      .setDepth(depth)
      .setVisible(false);

    this.label = scene.add
      .text(cx, cy, message, {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1)
      .setVisible(false);
  }

  show(): void {
    this.visible = true;
    this.overlay.setVisible(true);
    this.label.setVisible(true);
  }

  hide(): void {
    this.visible = false;
    this.overlay.setVisible(false);
    this.label.setVisible(false);
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.overlay.destroy();
    this.label.destroy();
  }
}

export function createRestartHint(scene: Phaser.Scene, options?: RestartHintOptions): RestartHint {
  return new RestartHint(scene, options);
}
