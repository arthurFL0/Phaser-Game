import { Scene, GameObjects } from 'phaser';
import Player from '../entities/Player';

export class Game extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    player: Player;
    platforms: any;
    vidaText: GameObjects.BitmapText;
    // alturaMapa = 1000;
    // larguraMapa = 3000;
    montanha: Phaser.GameObjects.TileSprite;
    ceu: Phaser.GameObjects.TileSprite;

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

        const larguraExata = map.widthInPixels;
        const alturaExata = map.heightInPixels;

        // 4. Configura as colisões
        // Isso diz que qualquer tile desenhado no Tiled com um índice maior que 0 vai colidir
        this.platforms.setCollisionByExclusion([-1]);

        // this.platforms = this.physics.add.staticGroup();


        
        // this.platforms.create(200, 568, 'ground').setScale(2).refreshBody();
        
        // this.platforms.create(512, 400, 'ground');
        // this.platforms.create(50, 1000, 'ground');
        // this.platforms.create(500, 900, 'ground');
        
        this.player = new Player(this, 50, 300);
        this.vidaText = this.add.bitmapText(10, 10, 'milky-font', 'Vida: 3', 16);

        this.physics.world.setBounds(0, 0, larguraExata, alturaExata);

        // Limita a câmera (para ela não filmar fora do mapa)
        this.cameras.main.setBounds(0, 0, larguraExata, alturaExata);

        // Configura o Follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // 5. Configura a Zona Morta (Deadzone) - Opcional, mas recomendado
        // Cria um retângulo de 100x50 pixels no meio da tela onde o jogador se move solto
        this.cameras.main.setDeadzone(100, 50);

        // Informa que este elemento não deve se mover quando a câmera avançar
        this.vidaText.setScrollFactor(0);

        this.physics.add.collider(this.player, this.platforms);



    }

    update (time: number, delta: number){
        const cameraX = this.cameras.main.scrollX;

        // Céu em efeito parallax com a câmera E um movimento extra baseado no tempo
        // 0.05 é a velocidade do parallax, 0.01 é a velocidade do baseada no relógio interno de atualização 
        this.ceu.tilePositionX = (cameraX * 0.05) + (time * 0.01); 
        
        // A montanha continua com o efeito parallax normal
        this.montanha.tilePositionX = Math.round(cameraX * 0.1);
    }
}
