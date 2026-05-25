


import { Scene } from 'phaser';

export class Fim extends Scene {
    constructor() {
        super('Fim');
    }

    create() {
        const GAME_WIDTH = 640;
        const GAME_HEIGHT = 360;

        // Inicia um fadeIn para a tela de fim
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Fundo com a tela de fim
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'tela_fim');

        this.time.delayedCall(12000, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('Menu');
            });
        });
    }
}