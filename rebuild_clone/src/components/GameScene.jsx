// GameScene.js
import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING } from './Config';
import Bullet from './Bullet';
import Zombie from './Zombie';
import * as CharacterManager from './CharacterManager';
import * as ZombieManager from './ZombieManager';
import { createBuildingDashboard } from './BuildingDashboard';
import { createPlayerHQ } from './PlayerHQManager';
import { placeBuilding } from './BuildingManager';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.resources = 100;
        this.characters = [];
        this.targets = [];
        this.selectedCharacter = null;
        this.bullets = null;
        this.zombies = null;
        this.placedBuildings = [];
        this.playerHQ = null;
        this.ghostBuildingKey = null;
    }

    preload() {
        this.load.spritesheet('character', '/WerewolfStalkerIdleSide.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('zombie', '/path/to/zombie.png');
        this.load.image('bullet', '/path/to/bullet.png');
    }

    create() {
        this.events.on('buildingSelected', this.handleBuildingSelection, this);

        this.createGameArea();
        this.playerHQ = createPlayerHQ(this);

        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        this.resourcesText = this.add.text(200, 10, 'Resources: 100', { fontSize: '16px', fill: '#fff' });

        const playerHQY = (GRID_HEIGHT - 5) * CELL_SIZE;
        const characterY = playerHQY - 2 * CELL_SIZE;
        const characterX = GRID_WIDTH / 2 * CELL_SIZE - CELL_SIZE;

        this.characters = [
            CharacterManager.createCharacter(this, characterX, characterY, 'character')
        ];

        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 30, runChildUpdate: true });
        this.zombies = this.physics.add.group({ classType: Zombie, maxSize: 20, runChildUpdate: true });

        this.physics.add.collider(this.bullets, this.zombies, (bullet, zombie) => {
            bullet.setActive(false);
            bullet.setVisible(false);
            zombie.takeDamage(10); // Assuming each bullet does 10 damage
        });

        this.time.addEvent({ delay: 2000, callback: () => ZombieManager.spawnZombie(this, this.zombies), loop: true });
        this.input.keyboard.on('keydown-SPACE', () => this.handleSpacebarPress());
        this.input.on('pointerdown', (pointer) => this.handlePointerDown(pointer));

        createBuildingDashboard(this, GRID_WIDTH * CELL_SIZE + 50, 0, 200, 50);
    }

    update() {
        CharacterManager.updateCharacters(this, this.characters, this.targets);
        ZombieManager.updateZombies(this.zombies);
        this.updateScoreAndResources();
    }

    createGameArea() {
        this.add.rectangle(0, 50, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE, 0x000000).setOrigin(0, 0);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.add.rectangle(x * CELL_SIZE + CELL_SPACING / 2, y * CELL_SIZE + 50 + CELL_SPACING / 2,
                    CELL_SIZE - CELL_SPACING, CELL_SIZE - CELL_SPACING, 0xffff00).setOrigin(0, 0);
            }
        }
    }

    handleSpacebarPress() {
        if (this.selectedCharacter) {
            let bullet = this.bullets.get();
            if (bullet) {
                bullet.fire(this.selectedCharacter.x, this.selectedCharacter.y);
            }
        }
    }

    handlePointerDown(pointer) {
        let characterSelected = false;
        this.characters.forEach((character, index) => {
            if (character.getBounds().contains(pointer.x, pointer.y)) {
                this.selectedCharacter = character;
                characterSelected = true;
            }
        });

        if (!characterSelected) {
            this.placeBuilding(pointer);
        }
    }

    placeBuilding(pointer) {
        if (this.ghostBuildingKey && this.canPlaceBuilding(pointer.x, pointer.y)) {
            let newBuilding = placeBuilding(this, pointer.x, pointer.y, this.ghostBuildingKey);
            if (newBuilding) {
                this.ghostBuildingKey = null;
            }
        }
    }

    canPlaceBuilding(x, y) {
        for (let placedBuilding of this.placedBuildings) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(placedBuilding.getBounds(), new Phaser.Geom.Rectangle(x, y, 50, 50))) {
                return false;
            }
        }
        return true;
    }

    updateScoreAndResources() {
        this.scoreText.setText('Score: ' + this.score);
        this.resourcesText.setText('Resources: ' + this.resources);
    }

    handleBuildingSelection(key) {
        this.ghostBuildingKey = key;
    }
}
