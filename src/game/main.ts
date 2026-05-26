import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Menu } from './scenes/Menu';
import { Fim } from './scenes/Fim';

const GAME_WIDTH = 640;  
const GAME_HEIGHT = 360; 

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: GAME_WIDTH,  
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    antialias: false,

    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        Menu,
        MainGame,
        Fim,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    const game = new Game({ ...config, parent });

    return game;
}

export default StartGame;
