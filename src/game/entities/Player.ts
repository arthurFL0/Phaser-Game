
import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'boris');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(5);
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.body!.setSize(5, 29);
        this.body!.setOffset(6, 0);

        if (!scene.anims.exists('andar')) {
            scene.anims.create({
                key: 'andar',
                frames: scene.anims.generateFrameNumbers('boris', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        } else {
            this.cursors = {} as Phaser.Types.Input.Keyboard.CursorKeys;
        }
    }

    // É chamado pelo Scene adicionado automaticamente a cada frame 
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (!this.cursors) return;

        this.setVelocityX(0); 

        if (this.cursors.right?.isDown) {
            this.setVelocityX(160);
            this.anims.play('andar', true);
            this.setFlipX(false);
        } else if (this.cursors.left?.isDown) {
            this.setVelocityX(-160);
            this.anims.play('andar', true);
            this.setFlipX(true);
            this.body!.setOffset(4, 0); 
        } else {
            this.anims.stop();
            this.setFrame(0);
        }

        if (this.cursors.up?.isDown && this.body!.touching.down) {
            this.setVelocityY(-330);
        }
    }
}
