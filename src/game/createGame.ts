import Phaser from 'phaser'
import { gameConfig } from './config'

export function createGame(parent = 'game'): Phaser.Game {
  return new Phaser.Game({
    ...gameConfig,
    parent,
  })
}
