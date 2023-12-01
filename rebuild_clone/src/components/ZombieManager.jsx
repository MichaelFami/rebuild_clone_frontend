// ZombieManager.js
import { CELL_SIZE } from './Config';

export function spawnZombie(scene, zombies) {
    const xPosition = Phaser.Math.Between(0, scene.game.config.width);
    let zombie = zombies.get(xPosition, 0);
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
