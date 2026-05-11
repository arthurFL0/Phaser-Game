import { Scene, GameObjects } from 'phaser';
import Player from '../entities/Player';

export class Game extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    player: Player;
    platforms: Phaser.Physics.Arcade.StaticGroup;
    vidaText: GameObjects.BitmapText;
    alturaMapa = 1000;
    larguraMapa = 3000;
    montanha: Phaser.GameObjects.TileSprite;
    ceu: Phaser.GameObjects.TileSprite;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        
        this.platforms = this.physics.add.staticGroup();
        this.ceu = this.add.tileSprite(0,0,640,360, 'ceu').setOrigin(0,0).setScrollFactor(0);
        this.montanha = this.add.tileSprite(0,0,640,360, 'montanha').setOrigin(0,0).setScrollFactor(0);

        
        // this.platforms.create(200, 568, 'ground').setScale(2).refreshBody();
        
        // this.platforms.create(512, 400, 'ground');
        this.platforms.create(50, 1000, 'ground');
        this.platforms.create(500, 900, 'ground');
        
        this.player = new Player(this, 50, 600);
        this.vidaText = this.add.bitmapText(10, 10, 'milky-font', 'Vida: 3', 16);

        this.physics.world.setBounds(0, 0, this.larguraMapa, this.alturaMapa);

        // Limita a câmera (para ela não filmar fora do mapa)
        this.cameras.main.setBounds(0, 0, this.larguraMapa, this.alturaMapa);

        // Configura o Follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // 5. Configura a Zona Morta (Deadzone) - Opcional, mas recomendado
        // Cria um retângulo de 100x50 pixels no meio da tela onde o jogador se move solto
        this.cameras.main.setDeadzone(100, 50);

        // Informa que este elemento não deve se mover quando a câmera avançar
        this.vidaText.setScrollFactor(0);

        this.physics.add.collider(this.player, this.platforms);



    }

    update (){
        const cameraX = this.cameras.main.scrollX;
        this.ceu.tilePositionX = Math.round(cameraX * 0.2);
        this.montanha.tilePositionX = Math.round(cameraX * 0.4);
    }
}
