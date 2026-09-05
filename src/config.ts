import Phaser from 'phaser'
import { PlayScene } from './PlayScene'
import { gameScale } from './play'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#12081c',
  scale: gameScale(Phaser.Scale),
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  scene: PlayScene,
}
