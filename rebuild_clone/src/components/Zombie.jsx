// Zombie.js
import Phaser from 'phaser';
import { CELL_SIZE } from './Config'; // Import CELL_SIZE if it's used in this file

export default class Zombie extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zombie');
        this.scene = scene;
        this.moveSpeed = 50;
        this.isActive = false;
        this.attackRate = 1000; // 1 attack per second
        this.attackDamage = 10;
        this.lastAttackTime = 0;
        this.health = 10; // Set initial health for the zombie

        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    activate() {
        this.isActive = true;
        this.body.velocity.y = this.moveSpeed;
    }

    update(time, delta) {
        if (!this.isActive) return;

        // Determine target based on proximity to characters, buildings, and player HQ
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
        if (target.active && Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= CELL_SIZE) {
            this.attack(target);
        }
    }

    attack(target) {
        if (this.scene.time.now > this.lastAttackTime + this.attackRate) {
            target.health -= this.attackDamage;
            this.lastAttackTime = this.scene.time.now;
            if (target.health <= 0) {
                target.destroy();
            }
        }
    }

    // Call this method when a zombie is hit by a bullet
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}
