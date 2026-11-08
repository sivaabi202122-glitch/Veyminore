/**
 * AROWGO — Main Entry Point
 *
 * Think. Clear. Go.
 */
import Phaser from 'phaser';
import { createGameConfig } from '@/config/game-config';
import { BootScene } from '@/game/scenes/BootScene';
import { MenuScene } from '@/game/scenes/MenuScene';
import { GameScene } from '@/game/scenes/GameScene';
import { ResultScene } from '@/game/scenes/ResultScene';

const config = createGameConfig([BootScene, MenuScene, GameScene, ResultScene]);

const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});

export default game;
