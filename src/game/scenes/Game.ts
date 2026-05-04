import { Scene, GameObjects } from 'phaser';
import Player from '../entities/Player';

export class Game extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    player: Player;
    platforms: Phaser.Physics.Arcade.StaticGroup;


    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');
        
        this.platforms = this.physics.add.staticGroup();
        
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        
        this.platforms.create(512, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        
        this.player = new Player(this, 100, 450);
       
        this.physics.add.collider(this.player, this.platforms);
    }

    update (){
    }
}
