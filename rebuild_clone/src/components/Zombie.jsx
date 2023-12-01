// Zombie.js
import Phaser from 'phaser';

export default class Zombie extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zombie');
        this.scene = scene;
        this.moveSpeed = 50;
        this.isActive = false;
        this.attackRate = 1000; // 1 attack per second
        this.attackDamage = 10;
        this.lastAttackTime = 0;

        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    activate() {
        this.isActive = true;
        this.body.velocity.y = this.moveSpeed;
    }

    update(time, delta) {
        if (!this.isActive) return;
        if (this.y >= this.scene.game.config.height / 2) {
            this.body.velocity.y = 0;
            this.moveTowardTarget();
        }
    }

    moveTowardTarget() {
        let closestCharacter = this.findClosestCharacter();
        if (closestCharacter) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, closestCharacter.x, closestCharacter.y);
            this.scene.physics.velocityFromRotation(angle, this.moveSpeed, this.body.velocity);
        }
    }

    findClosestCharacter() {
        let closestDistance = Infinity;
        let closestCharacter = null;

        this.scene.characters.forEach(character => {
            if (character.active) {
                let distance = Phaser.Math.Distance.Between(this.x, this.y, character.x, character.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCharacter = character;
                }
            }
        });

        return closestCharacter;
    }

    attack(target) {
        if (target.active && this.scene.time.now > this.lastAttackTime + this.attackRate) {
            target.health -= this.attackDamage;
            this.lastAttackTime = this.scene.time.now;
            if (target.health <= 0) {
                target.destroy();
            }
        }
    }
}
