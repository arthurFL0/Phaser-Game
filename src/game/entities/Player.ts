
import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private carregandoPulo: boolean = false;
    private velX: number = 130;
    private velXAr: number = 100;
    private puloForca: number = 150;
    private carregarPuloMax: number = 280;
    private pixelAzul: Phaser.GameObjects.Rectangle;
    private andarSFX: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound = this.scene.sound.add('andarMP3');
    private LIMITE_PULO_1 : number = 300;
    private LIMITE_PULO_2 : number = 500;
    private LIMITE_PULO_3 : number = 800;
    private diferencaLagrimasPe: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'boris');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.pixelAzul = scene.add.rectangle(x, y, 5, 5, 0x4290f5);
        this.pixelAzul.setVisible(false);
        
        this.setScale(3);
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.body!.setSize(5, 29);
        this.body!.setOffset(6, 0);

        this.criarAnimacoes(scene);

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        } else {
            this.cursors = {} as Phaser.Types.Input.Keyboard.CursorKeys;
        }

        // this.andarSFX.setVolume(0.4);
    }

    // É chamado pelo Scene adicionado automaticamente a cada frame 
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (!this.cursors) return;


        this.setVelocityX(0); 

        // Lógica do pulo e andar
        if (this.cursors.right?.isDown) {
            this.andarParaDireita();
        } else if (this.cursors.left?.isDown) {
            this.andarParaEsquerda();
        } else if (this.cursors.down?.isDown && this.body?.touching.down) {
            const tempoPressionado = this.cursors.down.getDuration();
            this.carregandoPulo = true;
            if(tempoPressionado >= this.LIMITE_PULO_3){
                this.animarLagrimas();
            }else if(this.anims.currentAnim?.key !== 'carregar_pulo'){
                this.anims.play('carregar_pulo');
            }

        } else if(Phaser.Input.Keyboard.JustUp(this.cursors.down) && this.body!.touching.down && this.carregandoPulo) {
                // this.pixelAzul.setVisible(false);
                this.scene.sound.play('puloMP3');
                const tempoPressionado = this.cursors.down.duration;
                this.carregandoPulo = false;
                this.anims.play('pulo');
                this.setVelocityY(- this.calcularPulo(tempoPressionado));
        } else if (this.body!.touching.down) {
            this.anims.stop();
            this.setFrame(0);
        } else if (this.anims.currentAnim?.key !== 'carregar_pulo' && this.anims.currentAnim?.key !== 'pulo') {
            this.anims.stop();
            this.setFrame(0);
        }

        if (this.cursors.up?.isDown && this.body!.touching.down) {
            this.scene.sound.play('puloMP3');
            this.anims.play('pulo');
            this.setVelocityY(- this.puloForca);
        }


        // if (this.body!.velocity.y > 0 && !this.body!.touching.down) {
        //     this.setFrame(11);
        // }
    }

    private andarParaDireita() {
        this.carregandoPulo = false;
        this.setVelocityX(this.velX);
        if (this.body!.touching.down) {
            // if (!this.andarSFX.isPlaying) this.andarSFX.play();
            this.anims.play('andar', true);
        } else if (this.anims.currentAnim?.key !== 'pulo') {
            this.setVelocityX(this.velXAr);
            this.anims.stop();
            this.setFrame(0);
        }
        this.setFlipX(false);
    }

    private andarParaEsquerda() {
        this.carregandoPulo = false;
        this.setVelocityX(-this.velX);
        if (this.body!.touching.down) {
            // if (!this.andarSFX.isPlaying) this.andarSFX.play();
            this.anims.play('andar', true);
        } else if (this.anims.currentAnim?.key !== 'pulo') {
            this.setVelocityX(-this.velXAr);
            this.anims.stop();
            this.setFrame(0);
        }
        this.setFlipX(true);
        this.body!.setOffset(4, 0);
    }

    private calcularPulo(tempoCarregando : number) : number {
        if(tempoCarregando < this.LIMITE_PULO_1){
            return this.carregarPuloMax * 0.3;
        }else if (tempoCarregando < this.LIMITE_PULO_2 ) {
            return this.carregarPuloMax * 0.5;
        }
        else if (tempoCarregando < this.LIMITE_PULO_3){
            return this.carregarPuloMax * 0.85;
        }
        else{
            return this.carregarPuloMax
        }
    }

    private animarLagrimas() {
        // this.pixelAzul.setVisible(true);
        // this.pixelAzul.setPosition(this.x + 2, this.y + 2);
        if( this.anims.currentAnim?.key !== 'pulo_limite' ) this.anims.play('pulo_limite');

    }

    private criarAnimacoes(scene : Phaser.Scene) {
         if (!scene.anims.exists('andar')) {
            scene.anims.create({
                key: 'andar',
                frames: scene.anims.generateFrameNumbers('boris', { start: 1, end: 5 }),
                frameRate: 12,
                repeat: -1
            });
        }

        if (!scene.anims.exists('carregar_pulo')) {
            scene.anims.create({
                key: 'carregar_pulo',
                frames: scene.anims.generateFrameNumbers('boris', { start: 6 , end: 9 }),
                frameRate: 12,
                repeat: 0
            });
        }

        if (!scene.anims.exists('pulo')) {
            scene.anims.create({
                key: 'pulo',
                frames: scene.anims.generateFrameNumbers('boris', { start: 10 , end: 10 }),
                frameRate: 1,
                repeat: 0
            });
        }


        if (!scene.anims.exists('pulo_limite')) {
            scene.anims.create({
                key: 'pulo_limite',
                frames: scene.anims.generateFrameNumbers('boris', { start: 12 , end: 14 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }
}
