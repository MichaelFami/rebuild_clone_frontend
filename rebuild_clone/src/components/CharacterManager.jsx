// CharacterManager.js
import { CELL_SIZE } from './Config';

export function createCharacter(scene, x, y, spriteKey) {
    let character = scene.physics.add.sprite(x, y, spriteKey).setScale(2);
    character.health = 100;

    // Add a method to the character for taking damage
    character.takeDamage = function(damage) {
        this.health -= damage;
        console.log(`Character took ${damage} damage, new health: ${this.health}`);
        if (this.health <= 0) {
            this.destroy();
        }
    };

    return character;
}

export function updateCharacters(scene, characters, targets) {
    characters.forEach((character, index) => {
        // The character destruction check is now handled within the takeDamage method
        const target = targets[index];
        if (target && target.x !== undefined && target.y !== undefined) {
            scene.physics.moveTo(character, target.x, target.y, 30);
            if (Phaser.Math.Distance.Between(character.x, character.y, target.x, target.y) < 10) {
                character.body.stop();
                targets[index] = { x: undefined, y: undefined };
            }
        }
    });
}
