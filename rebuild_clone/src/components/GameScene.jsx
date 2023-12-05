import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING } from './Config';
import Bullet from './Bullet';
import * as CharacterManager from './CharacterManager';
import { createBuildingDashboard } from './BuildingDashboard';
import { createPlayerHQ } from './PlayerHQManager';
import { placeBuilding } from './BuildingManager';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.gold = 400; // Initialize gold
        this.characters = [];
        this.targets = [];
        this.selectedCharacter = null;
        this.bullets = null;
        this.placedBuildings = [];
        this.playerHQ = null;
        this.ghostBuilding = null;
        this.ghostBuildingKey = null;
        this.buildingCosts = {
            'building1': 10,
            'building2': 25,
            'building3': 50,
            'building4': 100,
            'building5': 250
        };
    }

    preload() {
        this.load.spritesheet('character', '/Werewolf.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('bullet', '/path/to/bullet.png');
    }

    create() {
        this.events.on('buildingSelected', this.handleBuildingSelection, this);

        this.createGameArea();
        this.playerHQ = createPlayerHQ(this);

        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        this.resourcesText = this.add.text(200, 10, 'Gold: 400', { fontSize: '16px', fill: '#fff' });

        const playerHQY = (GRID_HEIGHT - 5) * CELL_SIZE;
        const characterY = playerHQY - 2 * CELL_SIZE;
        const characterX = GRID_WIDTH / 2 * CELL_SIZE - CELL_SIZE;

        this.characters = [CharacterManager.createCharacter(this, characterX, characterY, 'character')];

        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 30, runChildUpdate: true });

        this.input.keyboard.on('keydown-SPACE', () => this.handleSpacebarPress());
        this.input.on('pointerdown', (pointer) => this.handlePointerDown(pointer));

        createBuildingDashboard(this, GRID_WIDTH * CELL_SIZE + 50, 0, 200, 50);
    }

    update() {
        CharacterManager.updateCharacters(this, this.characters, this.targets);
        this.updateScoreAndResources();
    }

    createGameArea() {
        this.add.rectangle(0, 50, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE, 0x000000).setOrigin(0, 0);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.add.rectangle(x * CELL_SIZE + CELL_SPACING / 2, y * CELL_SIZE + 50 + CELL_SPACING / 2, CELL_SIZE - CELL_SPACING, CELL_SIZE - CELL_SPACING, 0xffff00).setOrigin(0, 0);
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
        this.characters.forEach((character) => {
            if (character.getBounds().contains(pointer.x, pointer.y)) {
                this.selectedCharacter = character;
                characterSelected = true;
            }
        });

        if (!characterSelected && this.ghostBuildingKey) {
            this.placeBuilding(pointer);
        }
    }

    placeBuilding(pointer) {
        if (this.canPlaceBuilding(pointer.x, pointer.y) && this.gold >= this.buildingCosts[this.ghostBuildingKey]) {
            let newBuilding = placeBuilding(this, pointer.x, pointer.y, this.ghostBuildingKey);
            if (newBuilding) {
                this.gold -= this.buildingCosts[this.ghostBuildingKey];
                this.updateScoreAndResources();
                if (this.ghostBuilding) {
                    this.ghostBuilding.destroy();
                    this.ghostBuilding = null;
                }
                this.ghostBuildingKey = null;
            }
        }
    }

    canPlaceBuilding(x, y) {
        return !this.placedBuildings.some(building => Phaser.Geom.Intersects.RectangleToRectangle(building.getBounds(), new Phaser.Geom.Rectangle(x, y, 50, 50)));
    }

    updateScoreAndResources() {
        this.scoreText.setText('Score: ' + this.score);
        this.resourcesText.setText('Gold: ' + this.gold);
    }

    handleBuildingSelection(key) {
        if (this.gold >= this.buildingCosts[key]) {
            if (this.ghostBuilding) {
                this.ghostBuilding.destroy();
            }
            this.ghostBuilding = this.add.image(this.input.x, this.input.y, key).setAlpha(0.5);
            this.ghostBuildingKey = key;
        }
    }
}
