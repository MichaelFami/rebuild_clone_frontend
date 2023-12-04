// GameScene.jsx
import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING } from './Config';
import Bullet from './Bullet';
import Zombie from './Zombie';
import * as CharacterManager from './CharacterManager';
import * as ZombieManager from './ZombieManager';
import createBuildingDashboard from './BuildingDashboard'; // Import the building dashboard

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.resources = 100;
        this.characters = [];
        this.targets = [];
        this.selectedCharacter = null;
    }

    preload() {
        // ...preload assets...
    }

    create() {
        this.add.rectangle(0, 50, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE, 0x000000).setOrigin(0, 0);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.add.rectangle(
                    x * CELL_SIZE + CELL_SPACING / 2, y * CELL_SIZE + 50 + CELL_SPACING / 2,
                    CELL_SIZE - CELL_SPACING, CELL_SIZE - CELL_SPACING,
                    0xffff00
                ).setOrigin(0, 0);
            }
        }
        
        this.playerHQ = this.add.rectangle(
            (GRID_WIDTH / 2 - 1) * CELL_SIZE, 
            (GRID_HEIGHT - 5) * CELL_SIZE,    
            2 * CELL_SIZE - CELL_SPACING,     
            2 * CELL_SIZE - CELL_SPACING,     
            0xff0000                          
        ).setOrigin(0, 0);

        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        this.resourcesText = this.add.text(200, 10, 'Resources: 100', { fontSize: '16px', fill: '#fff' });

        this.characters.push(CharacterManager.createCharacter(this, (GRID_WIDTH / 2 - 1) * CELL_SIZE, (GRID_HEIGHT - 9) * CELL_SIZE + 50, 'character'));
        this.characters.push(CharacterManager.createCharacter(this, (GRID_WIDTH / 2) * CELL_SIZE, (GRID_HEIGHT - 9) * CELL_SIZE + 50, 'secondCharacter'));

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });

        this.zombies = this.physics.add.group({
            classType: Zombie,
            maxSize: 20,
            runChildUpdate: true
        });

        this.time.addEvent({
            delay: 2000,
            callback: () => ZombieManager.spawnZombie(this, this.zombies),
            loop: true
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.selectedCharacter) {
                let bullet = this.bullets.get();
                if (bullet) {
                    bullet.fire(this.selectedCharacter.x, this.selectedCharacter.y);
                }
            }
        });

        this.input.on('pointerdown', (pointer) => {
            let characterSelected = false;
            this.characters.forEach((character, index) => {
                if (character.getBounds().contains(pointer.x, pointer.y)) {
                    this.selectedCharacter = character;
                    characterSelected = true;
                }
            });

            if (!characterSelected && this.selectedCharacter) {
                const selectedIndex = this.characters.indexOf(this.selectedCharacter);
                this.targets[selectedIndex] = { x: pointer.x, y: pointer.y };
            }
        });

        // Create the building dashboard
        const dashboardOffsetX = GRID_WIDTH * CELL_SIZE + 50; // Gap of 50 pixels
        const dashboardWidth = 200; // Width of the dashboard
        const buildingSize = 50; // Size of each building option
        createBuildingDashboard(this, dashboardOffsetX, 50, dashboardWidth, buildingSize);
    }

    update() {
        CharacterManager.updateCharacters(this, this.characters, this.targets);
        ZombieManager.updateZombies(this, this.zombies, this.characters);

        this.scoreText.setText('Score: ' + this.score);
        this.resourcesText.setText('Resources: ' + this.resources);
    }
}
