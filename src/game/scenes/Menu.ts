
import { Scene } from 'phaser';

export class Menu extends Scene {
    constructor() {
        super('Menu');
    }

    create() {
        const GAME_WIDTH = 640;
        const GAME_HEIGHT = 360;

        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'tela_inicio');

        const playButton = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'botaoJogar')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.startGame();
            });

        // Hover
        playButton.on('pointerover', () => {
            playButton.setTint(0xdddddd);
        });
        
        playButton.on('pointerout', () => {
            playButton.clearTint();
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            this.startGame();
        });
    }

    startGame() {
        this.scene.start('Game');
    }
}