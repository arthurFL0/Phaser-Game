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
    private buttonStates: Map<string, {
        rect: Phaser.Geom.Rectangle;
        bg: Phaser.GameObjects.Rectangle;
        label: Phaser.GameObjects.Text;
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
        scene.input.addPointer(9);
        this.createButtons();
        this.registerGlobalTouchEvents();
    }

    private createButtons() {
        const { width, height } = this.scene.scale;

        for (const cfg of this.BUTTON_CONFIGS) {
            const px = cfg.x >= 0 ? cfg.x : width  + cfg.x;
            const py = cfg.y >= 0 ? cfg.y : height + cfg.y;

            const bg = this.scene.add
                .rectangle(px, py, cfg.width, cfg.height, 0xffffff, 0.25)
                .setScrollFactor(0)       
                .setDepth(100);

            const label = this.scene.add
                .text(px, py, cfg.label, { fontSize: '28px', color: '#ffffff' })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(101);

            const rect = new Phaser.Geom.Rectangle(
                px - cfg.width  / 2,
                py - cfg.height / 2,
                cfg.width,
                cfg.height
            );

            this.buttonStates.set(cfg.key, {
                rect, bg, label,
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
                btn.bg.setFillStyle(0xffffff, 0.5);
            } else if (!hit && btn.pressed) {
                btn.pressed = false;
                btn.bg.setFillStyle(0xffffff, 0.25);
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

        this.buttonStates.forEach(({ bg, label }) => {
            bg.destroy();
            label.destroy();
        });
        this.buttonStates.clear();
    }
}