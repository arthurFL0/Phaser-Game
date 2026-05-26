
import { Scene } from 'phaser';

export class Menu extends Scene {
    private telaInicio!: Phaser.GameObjects.Image;
    private botaoJogar!: Phaser.GameObjects.Image;
    private gameStarting: boolean = false;

    constructor() {
        super('Menu');
    }

    create() {
        this.gameStarting = false;
        const GAME_WIDTH = 640;
        const GAME_HEIGHT = 360;

        this.telaInicio = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'tela_inicio');

        this.botaoJogar = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'botaoJogar')
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                if (!this.scale.isFullscreen) {
                    this.scale.startFullscreen();
                }
                if (!this.gameStarting) this.showScroll();
            });

        // Hover
        this.botaoJogar.on('pointerover', () => {
            this.botaoJogar.setTint(0xdddddd);
        });
        
        this.botaoJogar.on('pointerout', () => {
            this.botaoJogar.clearTint();
        });

        this.input.keyboard?.once('keyup-ENTER', () => {
            if (!this.scale.isFullscreen) {
                this.scale.startFullscreen();
            }
            if (!this.gameStarting) this.showScroll();
        });
    }

    showScroll() {
        this.gameStarting = true;
        const GAME_WIDTH = 640;
        const GAME_HEIGHT = 360;

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.telaInicio.destroy();
            this.botaoJogar.destroy();

            this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'scroll_bg');
            this.cameras.main.fadeIn(500, 0, 0, 0);

            this.time.delayedCall(5000, () => {
                const pressEnterText = this.add.image(540,300, 'press_enter');
                
                this.tweens.add({
                    targets: pressEnterText,
                    alpha: 0,
                    duration: 500,
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1
                });

                this.input.keyboard?.once('keydown-ENTER', () => {
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('Game');
                    });
                });
            });
        });
    }
}