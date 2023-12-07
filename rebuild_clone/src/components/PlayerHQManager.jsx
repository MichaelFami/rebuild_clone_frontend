import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING } from './Config';

export function createPlayerHQ(scene) {
    let playerHQ = scene.physics.add.sprite(
        (GRID_WIDTH / 2 - 1) * CELL_SIZE, 
        (GRID_HEIGHT - 5) * CELL_SIZE,    
        'playerHQ' // Use the key of the preloaded image
    ).setOrigin(0, 0);

    playerHQ.health = 500;
    playerHQ.setScale(.1, .1)
    playerHQ.setDepth(1); // Set the size of the sprite

    // Add a method to the playerHQ for taking damage
    playerHQ.takeDamage = function(damage) {
        this.health -= damage;
        console.log(`PlayerHQ took ${damage} damage, new health: ${this.health}`);
        if (this.health <= 0) {
            this.scene.gameOver();
        }
    };

    // Add playerHQ to the physics world for collision detection
    playerHQ.body.setImmovable(true);

    return playerHQ;
}
