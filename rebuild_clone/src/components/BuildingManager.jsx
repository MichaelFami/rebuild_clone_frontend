// BuildingManager.js
import Phaser from 'phaser';

export class Building {
    constructor(scene, x, y, key) {
        this.scene = scene;
        this.building = scene.physics.add.sprite(x, y, key).setOrigin(0.5, 0.5);

        // Adjust scale based on the building type
        const buildingScale = getBuildingScale(key);
        this.building.setScale(buildingScale);

        this.building.health = 100;
        this.key = key;

        // Add a method to the building for taking damage
        this.building.takeDamage = function(damage) {
            this.health -= damage;
            console.log(`Building took ${damage} damage, new health: ${this.health}`);
            if (this.health <= 0) {
                this.destroy();
            }
        };

        // Set up bullet shooting for the building
        let fireRate = getFireRate(key);
        scene.time.addEvent({
            delay: fireRate,
            callback: () => {
                if (this.building.active) {
                    this.fireBullet(key);
                }
            },
            loop: true
        });
    }

    fireBullet(buildingType) {
        switch(buildingType) {
            case 'building1':
                this.createBullet(-90); // Straight up
                break;
            case 'building2':
            case 'building3':
            case 'building4':
            case 'building5':
                // Fire one bullet straight up and two at 45-degree angles
                this.createMultipleBullets([-90, -45, -135]);
                break;
        }
    }

    createBullet(angle) {
        let bullet = this.scene.bullets.get(this.building.x, this.building.y - 16);
        if (bullet) {
            bullet.fire(this.building.x, this.building.y - 16, angle);
        }
    }

    createMultipleBullets(angles) {
        angles.forEach(angle => {
            this.createBullet(angle);
        });
    }
}

export function placeBuilding(scene, x, y, key) {
    if (!canPlaceBuilding(scene, x, y)) {
        return null;
    }

    let newBuilding = new Building(scene, x, y, key);
    scene.placedBuildings.push(newBuilding.building);
    return newBuilding;
}

function canPlaceBuilding(scene, x, y) {
    const isWithinPlaceableArea = y > scene.game.config.height * 0.7;
    let overlap = scene.placedBuildings.some(building => {
        return Phaser.Geom.Intersects.RectangleToRectangle(building.getBounds(), new Phaser.Geom.Rectangle(x, y, 50, 50));
    });
    return isWithinPlaceableArea && !overlap;
}



function getBuildingScale(key) {
    const buildingScales = {
        'building1': .08, // Example scale for building1
        'building2': .1, // Example scale for building2
        'building3': .08, // Example scale for building3
        'building4': .08, // Example scale for building3
        'building5': .08, // Example scale for building3
        // Add scales for other buildings as needed
    };
    return buildingScales[key] || 1.0; // Default scale if not specified
}

function getFireRate(key) {
    const fireRates = {
        'building1': 1000, // 1 second
        'building2': 2000, // 2 seconds
        'building3': 1000, // 1 second
        'building4': 500,  // half a second
        'building5': 250   // 10 times per second
    };
    return fireRates[key] || 1000; // Default to 1 second if not specified
}
