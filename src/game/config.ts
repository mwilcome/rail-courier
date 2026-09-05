import Phaser from 'phaser'
import { PlayScene } from '../scenes/PlayScene'

export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#1b1b2f',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false,
    },
  },
  scene: PlayScene,
}
