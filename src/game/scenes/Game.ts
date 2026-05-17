import { Scene, GameObjects } from 'phaser';
import Player from '../entities/Player';

export class Game extends Scene
{
    private player: Player;
    private platforms: any;
    private vidaText: GameObjects.BitmapText;
    private alturaMapa: number;
    private larguraMapa: number;
    private montanha: Phaser.GameObjects.TileSprite;
    private ceu: Phaser.GameObjects.TileSprite;
    private posicaoInicial = { x: 50, y: 400 };
    private alturaExtraMapa = 100;

    constructor ()
    {
        super('Game');
    }

    create ()
    {

        this.ceu = this.add.tileSprite(0,0,640,360, 'ceu').setOrigin(0,0).setScrollFactor(0);
        this.montanha = this.add.tileSprite(0,0,640,360, 'montanha').setOrigin(0,0).setScrollFactor(0);

        const map = this.make.tilemap({ key: 'mapa_fase1' });
        const tileset = map.addTilesetImage('mapa-spritesheet', 'mapa_spritesheet');
        if(tileset)
            this.platforms = map.createLayer('Camada de Blocos 1', tileset, 0, 0);

        this.larguraMapa = map.widthInPixels;
        this.alturaMapa = map.heightInPixels;

        // qualquer tile desenhado no Tiled com um índice maior que 0 vai colidir
        this.platforms.setCollisionByExclusion([-1]);

        this.player = new Player(this, this.posicaoInicial.x, this.posicaoInicial.y);
        this.vidaText = this.add.bitmapText(10, 10, 'milky-font', 'Vida: 3', 16);

        this.physics.world.setBounds(0, 0, this.larguraMapa, this.alturaMapa + this.alturaExtraMapa);

        // Limita a câmera (para ela não filmar fora do mapa)
        this.cameras.main.setBounds(0, 0, this.larguraMapa, this.alturaMapa);

        // Configura o Follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Cria um retângulo de 100x50 pixels no meio da tela onde o jogador se move solto
        this.cameras.main.setDeadzone(100, 50);

        // Informa que este elemento não deve se mover quando a câmera avançar
        this.vidaText.setScrollFactor(0);

        this.physics.add.collider(this.player, this.platforms);
        this.events.on('jogadorCaiu', () => {
        this.resetarJogadorComFade(); // 
        });


    }

    update (time: number, delta: number){
        const cameraX = this.cameras.main.scrollX;

        // Céu em efeito parallax com a câmera E um movimento extra baseado no tempo
        // 0.05 é a velocidade do parallax, 0.01 é a velocidade do baseada no relógio interno de atualização 
        this.ceu.tilePositionX = (cameraX * 0.05) + (time * 0.01); 
        
        // A montanha continua com o efeito parallax normal
        this.montanha.tilePositionX = Math.round(cameraX * 0.1);
    }

    private resetarJogadorComFade() {
        this.player.body!.enable = false;
        this.player.setVelocity(0, 0);

        this.cameras.main.fadeOut(250, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            
            this.player.setPosition(this.posicaoInicial.x, this.posicaoInicial.y);

            this.cameras.main.fadeIn(500, 0, 0, 0);

            this.player.body.enable = true;
            this.player.setRenascendo = false;
        });
    }
}
