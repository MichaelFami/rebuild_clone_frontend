import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING, ZOMBIE_SPAWN_RATE, ZOMBIE_DOUBLE_INTERVAL } from './Config';
import Bullet from './Bullet';
import Zombie, { spawnZombie, updateZombies } from './Zombie';  // Import Zombie related functionality
import * as CharacterManager from './CharacterManager';
import { createBuildingDashboard } from './BuildingDashboard';
import { createPlayerHQ } from './PlayerHQManager';
import { placeBuilding } from './BuildingManager';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.gold = 400;
        this.hqHealthText = null;
        this.characters = [];
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
        this.isGameOver = false;
        this.zombieSpawnCount = 1;
        this.nextDoubleTime = ZOMBIE_DOUBLE_INTERVAL;
    }

    preload() {
        this.load.image('cityOverlay', '/background2.png');

        this.load.spritesheet('character', '/Werewolf.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('bullet', '/path/to/bullet.png');
        this.load.spritesheet('zombie', '/SwampTroll.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.events.on('buildingSelected', this.handleBuildingSelection, this);
        this.createGameArea();
        this.playerHQ = createPlayerHQ(this);

        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        this.resourcesText = this.add.text(200, 10, 'Gold: 400', { fontSize: '16px', fill: '#fff' });
        this.cityOverlay = this.add.image(0, 50, 'cityOverlay').setOrigin(0, 0);
        this.cityOverlay.setDepth(0);
        const playerHQY = (GRID_HEIGHT - 5) * CELL_SIZE;
        const characterY = playerHQY - 2 * CELL_SIZE;
        const characterX = GRID_WIDTH / 2 * CELL_SIZE - CELL_SIZE;
        const healthTextX = this.resourcesText.x + this.resourcesText.width + 100;
        const healthTextY = this.resourcesText.y;

        this.hqHealthText = this.add.text(healthTextX, healthTextY, 'HQ Health: 500', { fontSize: '16px', fill: '#fff' });


        this.characters = [CharacterManager.createCharacter(this, characterX, characterY, 'character')];
        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 200, runChildUpdate: true });

        this.zombies = this.physics.add.group({ classType: Zombie, maxSize: 100, runChildUpdate: true });

        this.time.addEvent({
            delay: ZOMBIE_SPAWN_RATE,
            callback: () => this.spawnZombies(),
            loop: true
        });

        this.physics.add.collider(this.bullets, this.zombies, (bullet, zombie) => {
            bullet.hitTarget(); // Assuming this deactivates the bullet
            if (zombie.takeDamage(10)) {
                this.gold += 5; // Add gold for killing a zombie
                this.score += 5; // Increase score for killing a zombie
                this.updateScoreAndResources(); // Update score and gold display
            }
        });

        this.physics.add.collider(this.zombies, this.playerHQ, this.onHQDestroyed, null, this);

        this.input.keyboard.on('keydown-SPACE', () => this.handleSpacebarPress());
        this.input.on('pointerdown', (pointer) => this.handlePointerDown(pointer));

        createBuildingDashboard(this, GRID_WIDTH * CELL_SIZE + 50, 0, 200, 50);
    }

    update(time) {
        if (this.playerHQ) {
            this.hqHealthText.setText('HQ Health: ' + this.playerHQ.health);
        }
        if (!this.isGameOver) {
            CharacterManager.updateCharacters(this, this.characters);
            updateZombies(this.zombies);
            if (time > this.nextDoubleTime) {
                this.zombieSpawnCount *= 2;
                this.nextDoubleTime += ZOMBIE_DOUBLE_INTERVAL;
            }
        }
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
        if (this.isGameOver || !this.selectedCharacter) return;
        let bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(this.selectedCharacter.x, this.selectedCharacter.y);
        }
    }

    handlePointerDown(pointer) {
        if (this.isGameOver) return;
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
        if (this.isGameOver || !this.canPlaceBuilding(pointer.x, pointer.y) || this.gold < this.buildingCosts[this.ghostBuildingKey]) return;
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

    canPlaceBuilding(x, y) {
        return !this.placedBuildings.some(building => Phaser.Geom.Intersects.RectangleToRectangle(building.getBounds(), new Phaser.Geom.Rectangle(x, y, 50, 50)));
    }

    updateScoreAndResources() {
        if (this.isGameOver) return;
        this.scoreText.setText('Score: ' + this.score);
        this.resourcesText.setText('Gold: ' + this.gold);
    }

    handleBuildingSelection(key) {
        if (this.isGameOver || this.gold < this.buildingCosts[key]) return;
        if (this.ghostBuilding) {
            this.ghostBuilding.destroy();
        }
        this.ghostBuilding = this.add.image(this.input.x, this.input.y, key).setAlpha(0.5);
        this.ghostBuildingKey = key;
    }

    onHQDestroyed(zombie, hq) {
        if (hq.health <= 0 && !this.isGameOver) {
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
    
        // Create a black rectangle background for the game over text and button
        let gameOverBackground = this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            400, 200, 
            0x000000
        ).setOrigin(0.5);
    
        // Add 'Game Over You Lose' text
        this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY - 40, 
            'Game Over You Lose', 
            { fontSize: '32px', fill: '#fff' }
        ).setOrigin(0.5);
    
        // Add 'Try Again' button
        const tryAgainButton = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 40, 
            'Try Again', 
            { fontSize: '24px', fill: '#00ff00' }
        ).setOrigin(0.5).setInteractive();
    
        // Handle click on the 'Try Again' button
        tryAgainButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    spawnZombies() {
        for (let i = 0; i < this.zombieSpawnCount; i++) {
            spawnZombie(this, this.zombies);
        }
    }
}
