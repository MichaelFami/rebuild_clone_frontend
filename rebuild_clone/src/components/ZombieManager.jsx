// ZombieManager.js
import { GRID_WIDTH, CELL_SIZE } from './Config';

export function spawnZombie(scene, zombies) {
    // Calculate the maximum x-coordinate within the game grid
    const maxX = GRID_WIDTH * CELL_SIZE;

    // Randomly generate an x-coordinate within the game grid
    const xPosition = Phaser.Math.Between(0, maxX);

    // Get a zombie from the zombies group and activate it at the calculated position
    let zombie = zombies.get(xPosition, 0);  // Y-coordinate is 0 for spawning at the top
    if (zombie) {
        zombie.activate();
    }
}

export function updateZombies(scene, zombies, characters) {
    zombies.getChildren().forEach(zombie => {
        characters.filter(c => c.active).forEach(character => {
            if (Phaser.Math.Distance.Between(zombie.x, zombie.y, character.x, character.y) <= CELL_SIZE) {
                zombie.attack(character);
            }
        });
    });
}
