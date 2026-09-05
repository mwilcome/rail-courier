import Phaser from 'phaser'
import { PlayScene } from './PlayScene'

export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1b1b2f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
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
