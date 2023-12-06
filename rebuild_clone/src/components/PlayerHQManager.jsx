import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING } from './Config';

export function createPlayerHQ(scene) {
    let playerHQ = scene.add.rectangle(
        (GRID_WIDTH / 2 - 1) * CELL_SIZE, 
        (GRID_HEIGHT - 5) * CELL_SIZE,    
        2 * CELL_SIZE,     
        2 * CELL_SIZE,     
        0xff0000                          
    ).setOrigin(0, 0);
    playerHQ.health = 500;

    // Add a method to the playerHQ for taking damage
    playerHQ.takeDamage = function(damage) {
        this.health -= damage;
        console.log(`PlayerHQ took ${damage} damage, new health: ${this.health}`);
        if (this.health <= 0) {
            this.scene.gameOver();
        }
    };

    // Add playerHQ to the physics world for collision detection
    scene.physics.world.enable(playerHQ);
    playerHQ.body.setImmovable(true);

    return playerHQ;
}
