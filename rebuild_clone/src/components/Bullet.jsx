import Phaser from 'phaser';

export default class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'bullet'); // 'bullet' should be the key of your loaded bullet sprite
        this.speed = 300; // Speed of the bullet
        this.born = 0;    // Time since new bullet spawned

        scene.physics.world.enable(this);
        this.body.setAllowGravity(false);
        scene.add.existing(this);
    }

    // Fires a bullet from the player to the target
    fire(x, y) {
        this.setPosition(x, y - 16); // Adjust the offset if needed
        this.setActive(true);
        this.setVisible(true);
        this.born = 0; // Reset the 'born' time
    }

    // Updates the position of the bullet each frame
    update(time, delta) {
        this.y -= this.speed * delta / 1000;

        this.born += delta;
        if (this.born > 1000) { // Bullet lifespan in milliseconds
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
