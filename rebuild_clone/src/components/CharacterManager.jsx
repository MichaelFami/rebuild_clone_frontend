import { CELL_SIZE } from './Config';

export function createCharacter(scene, x, y, spriteKey) {
    // Create and scale the character sprite
    let character = scene.physics.add.sprite(x, y, spriteKey).setScale(2);

    // Initialize health property for the character
    character.health = 100;  // Example health value, you can adjust as needed

    // Method to handle taking damage
    character.takeDamage = function(damage) {
        this.health -= damage; // Subtract the damage from the character's health
        console.log(`Character took ${damage} damage, new health: ${this.health}`);

        // If health is zero or below, destroy the character
        if (this.health <= 0) {
            this.destroy();
        }
    };

    return character;
}

export function updateCharacters(scene, characters) {
    // Update logic for characters, if needed
    characters.forEach(character => {
        // Any character-specific update logic would go here
        // For example, you might want to update character animations or states
    });
}
