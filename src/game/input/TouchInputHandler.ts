import Phaser from 'phaser';
import { InputHandler, InputState } from './InputHandler';

interface ButtonConfig {
    x: number; y: number;
    width: number; height: number;
    angle: number;
    key: 'left' | 'right' | 'up' | 'down';
}

export class TouchInputHandler implements InputHandler {
    private scene: Phaser.Scene;
    private buttonStates: Map<string, {
        rect: Phaser.Geom.Rectangle;
        icon: Phaser.GameObjects.Sprite;
        pressed: boolean;
        pressedAt: number;
    }> = new Map();
    private prevDownDown = false;

    private readonly BUTTON_CONFIGS: ButtonConfig[] = [
        { key: 'left',  angle: 0,   x: 60,  y: -60, width: 70, height: 70 },
        { key: 'right', angle: 180, x: 140, y: -60, width: 70, height: 70 },
        { key: 'up',    angle: 90,  x: -70, y: -100, width: 70, height: 70 },
        { key: 'down',  angle: -90, x: -70, y: -160, width: 70, height: 70 },
    ];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        scene.input.addPointer(9);
        this.createButtons();
        this.registerGlobalTouchEvents();
    }

    private createButtons() {
        const { width, height } = this.scene.scale;

        for (const cfg of this.BUTTON_CONFIGS) {
            const px = cfg.x >= 0 ? cfg.x : width  + cfg.x;
            const py = cfg.y >= 0 ? cfg.y : height + cfg.y;

            const icon = this.scene.add
                .sprite(px, py, 'input_seta')
                .setOrigin(0.5)
                .setAngle(cfg.angle)
                .setScrollFactor(0)
                .setDepth(101)
                .setAlpha(1)
                .setScale(2);

            const rect = new Phaser.Geom.Rectangle(
                px - cfg.width  / 2,
                py - cfg.height / 2,
                cfg.width,
                cfg.height
            );

            this.buttonStates.set(cfg.key, {
                rect, icon,
                pressed: false,
                pressedAt: 0,
            });
        }
    }

    private registerGlobalTouchEvents() {
        this.scene.input.on('pointermove', this.updateAllButtons, this);
        this.scene.input.on('pointerdown', this.updateAllButtons, this);
        this.scene.input.on('pointerup',   this.updateAllButtons, this);
    }

    private updateAllButtons() {
        const now = this.scene.time.now;

        const activePointers = this.scene.input.manager.pointers
            .filter(p => p.isDown);

        for (const [key, btn] of this.buttonStates) {
            const hit = activePointers.some(p =>
                Phaser.Geom.Rectangle.Contains(btn.rect, p.x, p.y)
            );

            if (hit && !btn.pressed) {
                btn.pressed = true;
                btn.pressedAt = now;
                btn.icon.setAlpha(0.6);
            } else if (!hit && btn.pressed) {
                btn.pressed = false;
                btn.icon.setAlpha(1);
            }
        }
    }

    getState(): InputState {
        const now = this.scene.time.now;
        const down  = this.buttonStates.get('down')!;
        const downIsDown = down.pressed;
        const downJustReleased = this.prevDownDown && !downIsDown;
        this.prevDownDown = downIsDown;
        const downDuration = (downIsDown || downJustReleased) ? now - down.pressedAt : 0;

        return {
            left:  this.buttonStates.get('left')!.pressed,
            right: this.buttonStates.get('right')!.pressed,
            up:    this.buttonStates.get('up')!.pressed,
            down:  downIsDown,
            downDuration,
            downJustReleased,
        };
    }

    destroy() {
        this.scene.input.off('pointermove', this.updateAllButtons, this);
        this.scene.input.off('pointerdown', this.updateAllButtons, this);
        this.scene.input.off('pointerup',   this.updateAllButtons, this);

        this.buttonStates.forEach(({ icon }) => {
            icon.destroy();
        });
        this.buttonStates.clear();
    }
}