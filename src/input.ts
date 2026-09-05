import type Phaser from 'phaser'

export type Bumper = {
  bumpLeft(): void
  bumpRight(): void
}

const HIT = 88
const PAD = 20
const DEPTH = 1000

/**
 * Discrete L/R bumps only: one impulse per keydown or tap. Hold does not repeat.
 * Keyboard and on-screen buttons share the same bumper methods.
 */
export function bindBumpInput(scene: Phaser.Scene, bumper: Bumper): () => void {
  const onLeft = (): void => {
    bumper.bumpLeft()
  }
  const onRight = (): void => {
    bumper.bumpRight()
  }

  const leftKey = scene.input.keyboard?.addKey('LEFT', true)
  const rightKey = scene.input.keyboard?.addKey('RIGHT', true)
  leftKey?.on('down', onLeft)
  rightKey?.on('down', onRight)

  const leftBtn = makeHit(scene, onLeft)
  const rightBtn = makeHit(scene, onRight)
  const leftLabel = makeLabel(scene, 'L')
  const rightLabel = makeLabel(scene, 'R')

  const layout = (): void => {
    const { width, height } = scene.scale
    const y = height - PAD - HIT / 2
    const lx = PAD + HIT / 2
    const rx = width - PAD - HIT / 2
    leftBtn.setPosition(lx, y)
    leftLabel.setPosition(lx, y)
    rightBtn.setPosition(rx, y)
    rightLabel.setPosition(rx, y)
  }

  layout()
  scene.scale.on('resize', layout)

  return () => {
    leftKey?.off('down', onLeft)
    rightKey?.off('down', onRight)
    scene.scale.off('resize', layout)
    leftBtn.destroy()
    rightBtn.destroy()
    leftLabel.destroy()
    rightLabel.destroy()
  }
}

function makeHit(scene: Phaser.Scene, onPress: () => void): Phaser.GameObjects.Rectangle {
  const btn = scene.add
    .rectangle(0, 0, HIT, HIT, 0x1a1a1a, 0.8)
    .setStrokeStyle(2, 0xffffff, 0.85)
    .setScrollFactor(0)
    .setDepth(DEPTH)
    .setInteractive({ useHandCursor: true })

  btn.on('pointerdown', onPress)
  return btn
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
    .setDepth(DEPTH + 1)
}
