import { KeyboardInputHandler } from "./KeyboardInputHandler";
import { TouchInputHandler } from "./TouchInputHandler";

export interface InputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    downDuration: number;      
    downJustReleased: boolean; 
}

export interface InputHandler {
    getState(): InputState;
    destroy(): void;
}

export function createInputHandler(scene: Phaser.Scene): InputHandler {
    const isTouch = scene.sys.game.device.input.touch;
    if (isTouch) {
        return new TouchInputHandler(scene);
        
    }
    return new KeyboardInputHandler(scene);
}