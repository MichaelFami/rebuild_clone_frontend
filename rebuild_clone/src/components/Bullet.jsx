// Bullet.js
import Phaser from 'phaser';

export default class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'bullet');
        this.speed = 300; // Speed of the bullet

        scene.physics.world.enable(this);
        this.body.setAllowGravity(false);
        scene.add.existing(this);
    }

    // Fires a bullet from the player to the target
    fire(x, y) {
        this.setPosition(x, y); // Adjust the position as necessary
        this.setActive(true);
        this.setVisible(true);
    }

    // Updates the position of the bullet each frame
    update(time, delta) {
        // If the bullet is not active, skip updating its position
        if (!this.active) {
            return;
        }

        this.y -= this.speed * delta / 1000;

        // Check if the bullet has left the game area
        if (this.y < 0 || this.y > this.scene.game.config.height ||
            this.x < 0 || this.x > this.scene.game.config.width) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    // Call this method to deactivate the bullet
    hitTarget() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false; // Disable the physics body
        console.log(`Bullet deactivated`);
    }
}
