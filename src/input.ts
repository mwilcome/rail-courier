import type Phaser from 'phaser'

export type Bumper = { bumpLeft(): void; bumpRight(): void }

const HIT = 88
const PAD = 20

/** One impulse per keydown or tap. Hold does not repeat. */
export function bindBumpInput(scene: Phaser.Scene, bumper: Bumper): () => void {
  const left = () => bumper.bumpLeft()
  const right = () => bumper.bumpRight()
  const leftKey = scene.input.keyboard?.addKey('LEFT', true)
  const rightKey = scene.input.keyboard?.addKey('RIGHT', true)
  leftKey?.on('down', left)
  rightKey?.on('down', right)

  const lBtn = hit(scene, left)
  const rBtn = hit(scene, right)
  const lTxt = label(scene, 'L')
  const rTxt = label(scene, 'R')

  const layout = (): void => {
    const y = scene.scale.height - PAD - HIT / 2
    place(lBtn, lTxt, PAD + HIT / 2, y)
    place(rBtn, rTxt, scene.scale.width - PAD - HIT / 2, y)
  }
  layout()
  scene.scale.on('resize', layout)

  return () => {
    leftKey?.off('down', left)
    rightKey?.off('down', right)
    scene.scale.off('resize', layout)
    lBtn.destroy()
    rBtn.destroy()
    lTxt.destroy()
    rTxt.destroy()
  }
}

function hit(scene: Phaser.Scene, onPress: () => void): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(0, 0, HIT, HIT, 0x1a1a1a, 0.8)
    .setStrokeStyle(2, 0xffffff, 0.85)
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', onPress)
}

function label(scene: Phaser.Scene, text: string): Phaser.GameObjects.Text {
  return scene.add
    .text(0, 0, text, { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001)
}

function place(btn: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text, x: number, y: number): void {
  btn.setPosition(x, y)
  text.setPosition(x, y)
}
