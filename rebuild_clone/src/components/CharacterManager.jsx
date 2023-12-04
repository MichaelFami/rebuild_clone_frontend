import { CELL_SIZE } from './Config';

export function createCharacter(scene, x, y, spriteKey) {
    let character = scene.physics.add.sprite(x, y, spriteKey).setScale(2);
    character.health = 100;
    return character;
}

export function updateCharacters(scene, characters, targets) {
    characters.forEach((character, index) => {
        if (character.health <= 0) {
            character.destroy();
            characters.splice(index, 1);
        } else {
            const target = targets[index];
            if (target && target.x !== undefined && target.y !== undefined) {
                scene.physics.moveTo(character, target.x, target.y, 30);
                if (Phaser.Math.Distance.Between(character.x, character.y, target.x, target.y) < 10) {
                    character.body.stop();
                    targets[index] = { x: undefined, y: undefined };
                }
            }
        }
    });
}
