import { Scene, GameObjects } from 'phaser';
import Player from '../entities/Player';

export class Game extends Scene
{
    private player: Player;
    private platforms: any;
    private decoracoes: any;
    private decoracao_fundo: any;
    private grupoColisoes: any;
    private fullscreenText: GameObjects.BitmapText;
    private alturaMapa: number;
    private larguraMapa: number;
    private montanha: Phaser.GameObjects.TileSprite;
    private ceu: Phaser.GameObjects.TileSprite;
    private posicaoInicial = { x: 50, y: 500 };
    private alturaExtraMapa = 100;
    private gameCamera!: Phaser.Cameras.Scene2D.Camera;
    private finalizandoFase = false;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.finalizandoFase = false;

        this.ceu = this.add.tileSprite(0,0,640,360, 'ceu').setOrigin(0,0).setScrollFactor(0);
        this.montanha = this.add.tileSprite(0,0,640,360, 'montanha').setOrigin(0,0).setScrollFactor(0);

        // Força renderização sem antialiasing 
        this.ceu.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.montanha.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        const map = this.make.tilemap({ key: 'mapa_fase1' });
        const tileset = map.addTilesetImage('mapa-spritesheet', 'mapa_spritesheet');
        if(tileset){
            map.createLayer('decoracao_2',tileset,0,0);
            this.decoracoes = map.createLayer('decoracao', tileset, 0, 0);
            this.decoracao_fundo = map.createLayer('decoracao_fundo', tileset, 0, 0);
            this.platforms = map.createLayer('principal', tileset, 0, 0);
            this.decoracao_fundo.setDepth(10);
            this.renderObjectLayer(map, 'decoracao_objetos', tileset);

        }

        this.larguraMapa = map.widthInPixels;
        this.alturaMapa = map.heightInPixels;

        // Extrai collision shapes do tileset
        if (tileset) {
            this.criarColisoesDoTileset(tileset);
        }


        this.player = new Player(this, this.posicaoInicial.x, this.posicaoInicial.y);
        this.fullscreenText = this.add.bitmapText(320, 180, 'milky-font', 'Pressione F11 para Fullscreen', 24).setOrigin(0.5);

        // Listener para detectar mudança de Fullscreen (API e F11)
        const checarJanela = () => {
            // Verifica o modo tela cheia pela API do Phaser, documento HTML ou resolução da janela
            const isFullscreen = this.scale.isFullscreen || 
                                 document.fullscreenElement !== null || 
                                 (window.innerWidth === screen.width && window.innerHeight === screen.height);
            this.fullscreenText.setVisible(!isFullscreen);
        };

        // Executa imediatamente para garantir o estado inicial correto
        checarJanela();
        
        const onFullscreenChange = () => checarJanela();
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('msfullscreenchange', onFullscreenChange);
        // Expande o limite do mundo para passar da borda no mapa no fim
        this.physics.world.setBounds(0, 0, this.larguraMapa + 200, this.alturaMapa + this.alturaExtraMapa);

        // --------------------------------------------------------
        // CÂMERA DO JOGO 
        // ---------------------------------------------------------
        this.gameCamera = this.cameras.add(0, 0, 640, 360);
        this.gameCamera.setZoom(2); // Aplica o zoom apenas aqui


        this.gameCamera.setBounds(0, 0, this.larguraMapa, this.alturaMapa);
        this.gameCamera.startFollow(this.player, true, 0.08, 0.08);
        this.gameCamera.setDeadzone(15, 40);
        
        this.gameCamera.centerOn(this.posicaoInicial.x, this.posicaoInicial.y - 25);

        this.gameCamera.ignore([this.ceu, this.montanha, this.fullscreenText]);

        // ---------------------------------------------------------
        // CÂMERA DE INTERFACE / UI 
        // ---------------------------------------------------------
        const uiCamera = this.cameras.add(0, 0, 640, 360);

        uiCamera.ignore([this.ceu, this.montanha, this.player, this.platforms]);

        // Eventos de redimensionamento e Fullscreen
        window.addEventListener('resize', checarJanela);
        this.scale.on('fullscreenchange', checarJanela);
   
        this.events.once('shutdown', () => {
            window.removeEventListener('resize', checarJanela);
            this.scale.off('fullscreenchange', checarJanela);
            document.removeEventListener('fullscreenchange', checarJanela);
            document.removeEventListener('webkitfullscreenchange', checarJanela);
            document.removeEventListener('mozfullscreenchange', checarJanela);
            document.removeEventListener('msfullscreenchange', checarJanela);
        });

        this.physics.add.collider(this.player, this.grupoColisoes);
        this.events.on('jogadorCaiu', () => {
        this.resetarJogadorComFade(); // 
        });
        
        this.sound.play('musica', { loop: true, volume: 0.2 });
        

    }

    update (time: number, delta: number){
        const cameraX = this.gameCamera.scrollX;

        // Céu em efeito parallax com a câmera E um movimento extra baseado no tempo
        // 0.05 é a velocidade do parallax, 0.01 é a velocidade do baseada no relógio interno de atualização 
        this.ceu.tilePositionX = (cameraX * 0.05) + (time * 0.01); 
        
        // A montanha continua com o efeito parallax normal
        this.montanha.tilePositionX = Math.round(cameraX * 0.1);

        if (this.player.x > this.larguraMapa && !this.finalizandoFase) {
            this.finalizandoFase = true;
            this.player.destroy();
            this.gameCamera.fadeOut(1000, 0, 0, 0); // Fade out de 1 segundo para preto
            this.gameCamera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.sound.stopByKey('musica');
                this.scene.start('Fim');
            });
        }
    }

    private resetarJogadorComFade() {
        this.player.body!.enable = false;
        this.player.setVelocity(0, 0);

        this.gameCamera.fadeOut(250, 0, 0, 0);

        this.gameCamera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            
            this.player.setPosition(this.posicaoInicial.x, this.posicaoInicial.y);
            
            // Força a câmera a focar na mesma posição inicial imediatamente ao resetar
            this.gameCamera.centerOn(this.posicaoInicial.x, this.posicaoInicial.y - 25);

            this.gameCamera.fadeIn(500, 0, 0, 0);

            this.player.body.enable = true;
            this.player.setRenascendo = false;
        });
    }

    private renderObjectLayer(map: Phaser.Tilemaps.Tilemap, layerName: string, tileset: Phaser.Tilemaps.Tileset) {
        const objLayer = map.getObjectLayer(layerName);
    
        if (!objLayer) return;
    
        objLayer.objects.forEach((obj: any) => {
            if (obj.gid) {
                const tileId = obj.gid - 1; 
                            
                const sprite = this.add.image(
                    obj.x,
                    obj.y - obj.height,
                    'mapa_spritesheet', 
                    tileId
                );
                
                sprite.setOrigin(0, 0);
            }
        });
    }

    private criarColisoesDoTileset(tileset: Phaser.Tilemaps.Tileset) {
        const tilesetData = tileset.tileData as any;
        this.grupoColisoes = this.physics.add.staticGroup();
        
        this.platforms.forEachTile((tile: Phaser.Tilemaps.Tile) => {
            if (tile.index > 0) {
                const tileWorldX = tile.pixelX;
                const tileWorldY = tile.pixelY;
                let collisionX, collisionY, collisionWidth, collisionHeight;

                // Pega os dados deste tile específico
                const tileData = tilesetData?.[tile.index - 1];
                
                if (tileData?.objectgroup?.objects?.[0]) {
                    const shape = tileData.objectgroup.objects[0];
                    
                    // Cria retângulo usando a collision shape
                    collisionX = tileWorldX + shape.x + shape.width / 2;
                    collisionY = tileWorldY + shape.y + shape.height / 2;
                    collisionWidth = shape.width;
                    collisionHeight = shape.height;
                } else {
                    // Fallback: se não tiver custom shape, assume colisão do tamanho total do tile
                    collisionWidth = tile.width;
                    collisionHeight = tile.height;
                    collisionX = tileWorldX + collisionWidth / 2;
                    collisionY = tileWorldY + collisionHeight / 2;
                }
                
                const rect = this.add.rectangle(collisionX, collisionY, collisionWidth, collisionHeight);
                this.physics.add.existing(rect, true);
                
                const body = rect.body as Phaser.Physics.Arcade.StaticBody;
                
                // Prevenir que o player "agarre" nas divisas (seams) dos tiles na parede
                const tileUp = this.platforms.getTileAt(tile.x, tile.y - 1);
                if (tileUp && tileUp.index > 0) {
                    body.checkCollision.up = false;
                }
                
                const tileDown = this.platforms.getTileAt(tile.x, tile.y + 1);
                if (tileDown && tileDown.index > 0) {
                    body.checkCollision.down = false;
                }

                this.grupoColisoes.add(rect);
                rect.setVisible(false);
            }
        });
    }
}
