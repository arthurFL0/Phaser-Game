import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

const GAME_WIDTH = 640;  
const GAME_HEIGHT = 360; 

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: GAME_WIDTH,  
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,

    scale: {
        mode: Phaser.Scale.NONE, 
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
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    const game = new Game({ ...config, parent });

    const redimensionarPerfeitamente = () => {
        const canvas = game.canvas;
        if (!canvas) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const scaleX = windowWidth / GAME_WIDTH;
        const scaleY = windowHeight / GAME_HEIGHT;

        let scale = Math.floor(Math.min(scaleX, scaleY));
        if (scale < 1) scale = 1;

        canvas.style.width = `${GAME_WIDTH * scale}px`;
        canvas.style.height = `${GAME_HEIGHT * scale}px`;
    };

    window.addEventListener('resize', redimensionarPerfeitamente);
    
    setTimeout(redimensionarPerfeitamente, 100);

    return game;
}

export default StartGame;
