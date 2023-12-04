import { GRID_WIDTH, CELL_SIZE } from './Config';

export function spawnZombie(scene, zombies) {
    const maxX = GRID_WIDTH * CELL_SIZE;
    const xPosition = Phaser.Math.Between(0, maxX);

    let zombie = zombies.get(xPosition, 0);
    if (zombie) {
        zombie.activate();
    }
}

export function updateZombies(zombies) {
    zombies.getChildren().forEach(zombie => {
        // Just call update without parameters
        zombie.update();
    });
}
