import Phaser from 'phaser';
import { InputHandler, InputState } from './InputHandler';

export class KeyboardInputHandler implements InputHandler {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private prevDownDown = false;

    constructor(scene: Phaser.Scene) {
        this.cursors = scene.input.keyboard!.createCursorKeys();
    }

    getState(): InputState {
        const downIsDown  = this.cursors.down?.isDown ?? false;
        const downJustReleased = this.prevDownDown && !downIsDown;
        this.prevDownDown = downIsDown;

        const downDuration = downIsDown 
            ? (this.cursors.down?.getDuration() ?? 0) 
            : (this.cursors.down?.duration ?? 0);

        return {
            left:             this.cursors.left?.isDown  ?? false,
            right:            this.cursors.right?.isDown ?? false,
            up:               this.cursors.up?.isDown    ?? false,
            down:             downIsDown,
            downDuration,
            downJustReleased,
        };
    }

    destroy() {
    }
}