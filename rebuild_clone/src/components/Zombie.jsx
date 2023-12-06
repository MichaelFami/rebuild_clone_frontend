import Phaser from 'phaser';
import { GRID_WIDTH, CELL_SIZE } from './Config';

export default class Zombie extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zombie');
        this.scene = scene;
        this.attackRate = 1000; // 1 second between attacks
        this.lastAttackTime = 0;
        this.attackDamage = 10;
        this.moveSpeed = 50;
        this.health = 10;
        this.setScale(2);

        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    activate() {
        this.isActive = true;
    }

    update(time, delta) {
         // Check if the game is over
    if (this.scene.isGameOver) {
        return; // Stop updating if the game is over
    }
        if (!this.isActive) return;

        const target = this.findNearestTarget();
        if (target) {
            this.moveTowardTarget(target);
            this.attackIfInRange(target);
        }
    }

    findNearestTarget() {
        const allTargets = [...this.scene.characters, ...this.scene.placedBuildings, this.scene.playerHQ];
        let closestTarget = null;
        let closestDistance = Infinity;

        allTargets.forEach(target => {
            if (target.active) {
                let distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestTarget = target;
                }
            }
        });

        return closestTarget;
    }

    moveTowardTarget(target) {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.scene.physics.velocityFromRotation(angle, this.moveSpeed, this.body.velocity);
    }

    attackIfInRange(target) {
        if (
            target.active && 
            Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= CELL_SIZE &&
            typeof target.takeDamage === 'function' // Check if target has takeDamage method
        ) {
            const now = this.scene.time.now;
            if (now > this.lastAttackTime + this.attackRate) {
                target.takeDamage(this.attackDamage);
                this.lastAttackTime = now;
            }
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy(); // This removes the zombie from the game
            return true; // Indicates the zombie was killed
        }
        return false; // Zombie is still alive
    }
}

// Function to spawn zombies
export function spawnZombie(scene, zombies) {
    const xPosition = Phaser.Math.Between(0, GRID_WIDTH * CELL_SIZE);
    let zombie = zombies.get(xPosition, 0, 'zombie');
    if (zombie) {
        zombie.activate();
    }
}

// Function to update all zombies in the game
export function updateZombies(zombies) {
    zombies.getChildren().forEach(zombie => {
        if (zombie.active) {
            zombie.update();
        }
    });
}
