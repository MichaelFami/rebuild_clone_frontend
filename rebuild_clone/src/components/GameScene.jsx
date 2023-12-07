import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING, ZOMBIE_SPAWN_RATE, ZOMBIE_DOUBLE_INTERVAL } from './Config';
import Bullet from './Bullet';
import Zombie, { spawnZombie, updateZombies } from './Zombie';
import * as CharacterManager from './CharacterManager';
import { createBuildingDashboard } from './BuildingDashboard';
import { createPlayerHQ } from './PlayerHQManager';
import { placeBuilding } from './BuildingManager';

export default class GameScene extends Phaser.Scene {
    constructor(restartGameCallback) {
        super('GameScene');
        this.restartGameCallback = restartGameCallback;
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
        this.load.image('cityOverlay', '/background4.png');
        this.load.image('character', '/soldier.png');
        this.load.spritesheet('bullet', '/bullet2.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('zombie', '/SwampTroll.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('building1', '/4wheeler.png');
        this.load.image('building2', '/van1.png');
        this.load.image('building3', '/firestation2.png');
        this.load.image('building4', '/policestation.png');
        this.load.image('building5', '/tank.png');
        this.load.html('usernameForm', './usernameForm.html');
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
        this.zombieSpawnCount = 1;
        this.nextDoubleTime = this.time.now + ZOMBIE_DOUBLE_INTERVAL;
    
       
      
        this.zombies = this.physics.add.group({ classType: Zombie, maxSize: 100, runChildUpdate: true });
        


        this.time.addEvent({
            delay: ZOMBIE_SPAWN_RATE,
            callback: () => this.spawnZombies(),
            loop: true
        });

        this.physics.add.collider(this.bullets, this.zombies, (bullet, zombie) => {
            bullet.hitTarget();
            if (zombie.takeDamage(10)) {
                this.gold += 5;
                this.score += 5;
                this.updateScoreAndResources();
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
    spawnZombies() {
        for (let i = 0; i < this.zombieSpawnCount; i++) {
            spawnZombie(this, this.zombies);
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
    
        // Game Over Text
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 80, 'Game Over', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
    
        // Reset game variables
        this.zombieSpawnCount = 1;
        this.nextDoubleTime = ZOMBIE_DOUBLE_INTERVAL;
        if (this.bullets) this.bullets.clear(true, true);
        if (this.zombies) this.zombies.clear(true, true);
        this.characters = []; // Reinitialize or clear characters
        this.placedBuildings = []; // Reinitialize or clear buildings
    
        // Create an input element for the username
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Username';
        usernameInput.style.position = 'absolute';
        usernameInput.style.top = '50%';
        usernameInput.style.left = '50%';
        usernameInput.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(usernameInput);
    
        // Create a button to save the score and restart the game
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Score And Try Again';
        saveButton.style.position = 'absolute';
        saveButton.style.top = '55%';
        saveButton.style.left = '50%';
        saveButton.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(saveButton);
    
        // Event listener for the save button
        saveButton.addEventListener('click', () => {
            const username = usernameInput.value;
            saveScoreToDatabase(username, this.score);
    
            // Clean up HTML elements
            usernameInput.remove();
            saveButton.remove();
    
            // Reload the entire web page
            window.location.reload();
        });
    }
    
    
    

    

    
}
function saveScoreToDatabase(username, score) {
    // Implement the logic to save the score and username to your database.
    console.log(`Saving score: ${score}, Username: ${username}`);
}