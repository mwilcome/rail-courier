import type Phaser from 'phaser';
import { STUB_BUMP_API, type BumpApi } from '../input/BumpInput';

const HIT = 88;
const PAD = 20;
const DEPTH = 1000;

/**
 * On-screen L / R bump buttons. One impulse per press/tap.
 * Hit boxes are 88px for mobile thumbs.
 */
export class BumpButtons {
  private readonly scene: Phaser.Scene;
  private readonly leftBtn: Phaser.GameObjects.Rectangle;
  private readonly rightBtn: Phaser.GameObjects.Rectangle;
  private readonly leftLabel: Phaser.GameObjects.Text;
  private readonly rightLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, api: BumpApi = STUB_BUMP_API) {
    this.scene = scene;

    this.leftBtn = makeHitTarget(scene, () => api.bumpLeft());
    this.rightBtn = makeHitTarget(scene, () => api.bumpRight());
    this.leftLabel = makeLabel(scene, 'L');
    this.rightLabel = makeLabel(scene, 'R');

    this.layout();
    scene.scale.on('resize', this.layout, this);
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);
    this.leftBtn.destroy();
    this.rightBtn.destroy();
    this.leftLabel.destroy();
    this.rightLabel.destroy();
  }

  private layout = (): void => {
    const { width, height } = this.scene.scale;
    const y = height - PAD - HIT / 2;
    place(this.leftBtn, this.leftLabel, PAD + HIT / 2, y);
    place(this.rightBtn, this.rightLabel, width - PAD - HIT / 2, y);
  };
}

export function createBumpButtons(scene: Phaser.Scene, api?: BumpApi): BumpButtons {
  return new BumpButtons(scene, api);
}

function makeHitTarget(scene: Phaser.Scene, onPress: () => void): Phaser.GameObjects.Rectangle {
  const btn = scene.add
    .rectangle(0, 0, HIT, HIT, 0x1a1a1a, 0.8)
    .setStrokeStyle(2, 0xffffff, 0.85)
    .setScrollFactor(0)
    .setDepth(DEPTH)
    .setInteractive({ useHandCursor: true });

  btn.on('pointerdown', onPress);
  return btn;
}

function makeLabel(scene: Phaser.Scene, text: string): Phaser.GameObjects.Text {
  return scene.add
    .text(0, 0, text, {
      fontFamily: 'sans-serif',
      fontSize: '32px',
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(DEPTH + 1);
}

function place(
  btn: Phaser.GameObjects.Rectangle,
  label: Phaser.GameObjects.Text,
  x: number,
  y: number,
): void {
  btn.setPosition(x, y);
  label.setPosition(x, y);
}
