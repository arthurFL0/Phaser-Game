import { Scene, GameObjects } from 'phaser';
import Player from '../entities/Player';

export class Game extends Scene
{
    private player: Player;
    private platforms: any;
    private vidaText: GameObjects.BitmapText;
    private fullscreenText: GameObjects.BitmapText;
    private alturaMapa: number;
    private larguraMapa: number;
    private montanha: Phaser.GameObjects.TileSprite;
    private ceu: Phaser.GameObjects.TileSprite;
    private posicaoInicial = { x: 50, y: 400 };
    private alturaExtraMapa = 100;
    private gameCamera!: Phaser.Cameras.Scene2D.Camera;

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
        this.fullscreenText = this.add.bitmapText(320, 180, 'milky-font', 'Pressione F11 para Fullscreen', 24).setOrigin(0.5);
        this.fullscreenText.setVisible(!this.scale.isFullscreen);

        this.physics.world.setBounds(0, 0, this.larguraMapa, this.alturaMapa + this.alturaExtraMapa);

        // --------------------------------------------------------
        // CÂMERA DO JOGO 
        // ---------------------------------------------------------
        this.gameCamera = this.cameras.add(0, 0, 640, 360);
        this.gameCamera.setZoom(2); // Aplica o zoom apenas aqui


        this.gameCamera.setBounds(0, 0, this.larguraMapa, this.alturaMapa);
        this.gameCamera.startFollow(this.player, true, 0.08, 0.08);
        this.gameCamera.setDeadzone(15, 40);

        this.gameCamera.ignore([this.ceu, this.montanha, this.vidaText, this.fullscreenText]);

        // ---------------------------------------------------------
        // CÂMERA DE INTERFACE / UI 
        // ---------------------------------------------------------
        const uiCamera = this.cameras.add(0, 0, 640, 360);

        uiCamera.ignore([this.ceu, this.montanha, this.player, this.platforms]);

        // Listener para detectar mudança de Fullscreen
        const checarJanela = () => {
            const isFullscreen = window.innerHeight === window.screen.height;
            this.fullscreenText.setVisible(!isFullscreen);
        };

        window.addEventListener('resize', checarJanela);
   
        this.events.once('shutdown', () => {
            window.removeEventListener('resize', checarJanela);
        });

        this.physics.add.collider(this.player, this.platforms);
        this.events.on('jogadorCaiu', () => {
        this.resetarJogadorComFade(); // 
        });


    }

    update (time: number, delta: number){
        const cameraX = this.gameCamera.scrollX;

        // Céu em efeito parallax com a câmera E um movimento extra baseado no tempo
        // 0.05 é a velocidade do parallax, 0.01 é a velocidade do baseada no relógio interno de atualização 
        this.ceu.tilePositionX = (cameraX * 0.05) + (time * 0.01); 
        
        // A montanha continua com o efeito parallax normal
        this.montanha.tilePositionX = Math.round(cameraX * 0.1);
    }

    private resetarJogadorComFade() {
        this.player.body!.enable = false;
        this.player.setVelocity(0, 0);

        this.gameCamera.fadeOut(250, 0, 0, 0);

        this.gameCamera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            
            this.player.setPosition(this.posicaoInicial.x, this.posicaoInicial.y);

            this.gameCamera.fadeIn(500, 0, 0, 0);

            this.player.body.enable = true;
            this.player.setRenascendo = false;
        });
    }
}
