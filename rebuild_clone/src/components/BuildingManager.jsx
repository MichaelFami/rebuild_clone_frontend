// BuildingManager.js
export class Building {
    constructor(scene, x, y, key) {
        this.scene = scene;
        this.building = scene.add.rectangle(x, y, 50, 50, getBuildingColor(key));
        this.building.health = 100;
        this.key = key;

        // Set up bullet shooting for the building
        scene.time.addEvent({
            delay: 1000, // 1 second
            callback: () => {
                if (this.building.active) {
                    this.fireBullet();
                }
            },
            loop: true
        });
    }

    fireBullet() {
        let bullet = this.scene.bullets.get(this.building.x, this.building.y - 16);
        if (bullet) {
            bullet.fire(this.building.x, this.building.y - 16);
        }
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

function getBuildingColor(key) {
    const colors = {
        'building1': 0xff0000,
        'building2': 0x00ff00,
        'building3': 0x0000ff,
        'building4': 0xffff00,
        'building5': 0xff00ff,
        
    };
    return colors[key] || 0xffffff; // Default color
}
