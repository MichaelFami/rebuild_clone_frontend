// Zombie.js
import Phaser from "phaser";
import { GRID_WIDTH, CELL_SIZE } from './Config';

export default class Zombie extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zombie');
        this.scene = scene;
        this.isActive = false;
        this.lastAttackTime = 0;
        this.attackRate = 1000;  // 1 second between successful attacks
        this.health = 10;
        this.attackDamage = 10;
        this.moveSpeed = 50;

        this.attackAttemptRate = 1000;  // 1 second between attack attempts
        this.lastAttackAttemptTime = 0;

        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    activate() {
        this.isActive = true;
        this.body.velocity.y = this.moveSpeed;
    }

    update(time, delta) {
        if (!this.isActive) return;

        const now = this.scene.time.now;
        const target = this.findNearestTarget();
        if (target && now > this.lastAttackAttemptTime + this.attackAttemptRate) {
            this.moveTowardTarget(target);
            this.attackIfInRange(target);
            this.lastAttackAttemptTime = now;
        }
    }

    findNearestTarget() {
        return [...this.scene.characters, ...this.scene.placedBuildings, this.scene.playerHQ].reduce((closest, target) => {
            if (!target.active) return closest;
            let distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            return distance < (closest.distance || Infinity) ? { target, distance } : closest;
        }, {}).target;
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
        console.log("Before attack - Zombie instance:", this instanceof Zombie);
        console.log("Attempting attack");
        if (this.scene.time.now > this.lastAttackTime + this.attackRate) {
            target.takeDamage(this.attackDamage);
            this.lastAttackTime = this.scene.time.now;
        }
        console.log("After attack - Zombie instance:", this instanceof Zombie);

    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
            return true; // Zombie was killed
        }
        return false; // Zombie is still alive
    }
}

// Zombie management functions

export function spawnZombie(scene, zombies) {
    const maxX = GRID_WIDTH * CELL_SIZE;
    const xPosition = Phaser.Math.Between(0, maxX);
    let zombie = zombies.get(xPosition, 50, 'zombie');
    if (zombie) {
        zombie.activate();
        console.log("Spawned zombie:", zombie, "Zombie instance:", zombie instanceof Zombie);
    }
}

export function updateZombies(zombies) {
    zombies.getChildren().forEach(zombie => zombie.update());
}
