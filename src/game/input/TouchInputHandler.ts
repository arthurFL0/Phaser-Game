import Phaser from 'phaser';
import { InputHandler, InputState } from './InputHandler';

interface ButtonConfig {
    x: number; y: number;
    width: number; height: number;
    label: string;
    key: 'left' | 'right' | 'up' | 'down';
}

export class TouchInputHandler implements InputHandler {
    private scene: Phaser.Scene;
    private buttons: Map<string, {
        image: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
        text: Phaser.GameObjects.Text;
        pressed: boolean;
        pressedAt: number;
    }> = new Map();
    private prevDownDown = false;

    private readonly BUTTON_CONFIGS: ButtonConfig[] = [
        { key: 'left',  label: '◀', x: 60,  y: -100, width: 70, height: 70 },
        { key: 'right', label: '▶', x: 140, y: -100, width: 70, height: 70 },
        { key: 'up',    label: '▲', x: -80, y: -100, width: 70, height: 70 },
        { key: 'down',  label: '▼', x: -80, y: -170, width: 70, height: 70 },
    ];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createButtons();
    }

    private createButtons() {
        const { width, height } = this.scene.scale;

        for (const cfg of this.BUTTON_CONFIGS) {
            // Posição relativa à borda da tela
            const px = cfg.x >= 0 ? cfg.x : width  + cfg.x;
            const py = cfg.y >= 0 ? cfg.y : height + cfg.y;

            const bg = this.scene.add
                .rectangle(px, py, cfg.width, cfg.height, 0xffffff, 0.25)
                .setScrollFactor(0)       
                .setDepth(100)
                .setInteractive();

            const label = this.scene.add
                .text(px, py, cfg.label, { fontSize: '28px', color: '#ffffff' })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(101);

            const entry = { image: bg, text: label, pressed: false, pressedAt: 0 };
            this.buttons.set(cfg.key, entry);

            bg.on('pointerdown', () => {
                entry.pressed = true;
                entry.pressedAt = this.scene.time.now;
                bg.setFillStyle(0xffffff, 0.5);
            });

            bg.on('pointerup',   () => this.release(cfg.key, bg));
            bg.on('pointerout',  () => this.release(cfg.key, bg));
        }
    }

    private release(key: string, bg: Phaser.GameObjects.Rectangle) {
        const entry = this.buttons.get(key);
        if (!entry) return;
        entry.pressed = false;
        bg.setFillStyle(0xffffff, 0.25);
    }

    getState(): InputState {
        const now = this.scene.time.now;
        const down  = this.buttons.get('down')!;
        const downIsDown = down.pressed;
        const downJustReleased = this.prevDownDown && !downIsDown;
        this.prevDownDown = downIsDown;
        const downDuration = (downIsDown || downJustReleased) ? now - down.pressedAt : 0;

        return {
            left:  this.buttons.get('left')!.pressed,
            right: this.buttons.get('right')!.pressed,
            up:    this.buttons.get('up')!.pressed,
            down:  downIsDown,
            downDuration,
            downJustReleased,
        };
    }

    destroy() {
        this.buttons.forEach(({ image, text }) => {
            image.destroy();
            text.destroy();
        });
        this.buttons.clear();
    }
}