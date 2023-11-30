import React, { useEffect } from 'react';
import Phaser from 'phaser';

const PhaserGame = () => {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 900,
            height: 900,
            parent: 'phaser-example',
            scene: {
                preload: function() { preload(this) },
                create: function() { create(this) },
                update: function() { update(this) },
            },
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
            }
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    let score = 0; // Example score
    let resources = 100; // Example resources
    let scoreText, resourcesText; // Text elements for dashboard

    const preload = (scene) => {
        scene.load.spritesheet('character', '/WerewolfStalkerIdleSide.png', { frameWidth: 16, frameHeight: 16 });
        scene.load.spritesheet('secondCharacter', '/SwampTrollIdleSide.png', { frameWidth: 16, frameHeight: 16 });

    };

    let character;
    let secondCharacter; // New variable for the second character
    let selectedCharacter;
    let targetX, targetY;

    const create = (scene) => {
        // Dashboard creation
        scene.add.rectangle(0, 0, scene.sys.game.config.width, 50, 0x333333).setOrigin(0, 0);
        scoreText = scene.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        resourcesText = scene.add.text(200, 10, 'Resources: 100', { fontSize: '16px', fill: '#fff' });

        // Grid creation
        const gridWidth = 30;
        const gridHeight = 30;
        const cellSize = 32; // Size of each cell
        const cellSpacing = 2; // Spacing between cells to create lines

        const backgroundColor = 0x000000; // Optional: Set the background color for the grid area
        scene.add.rectangle(0, 50, gridWidth * cellSize, gridHeight * cellSize, backgroundColor).setOrigin(0, 0);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                scene.add.rectangle(
                    x * cellSize + cellSpacing / 2, y * cellSize + 50 + cellSpacing / 2,
                    cellSize - cellSpacing, cellSize - cellSpacing,
                    0xffff00 // Yellow color for the cell
                ).setOrigin(0, 0);
            }
        }

        // Character creation
        character = scene.physics.add.sprite(100, 150, 'character');
        character.setScale(2); // Adjust scale if necessary
        secondCharacter = scene.physics.add.sprite(200, 150, 'secondCharacter');
        secondCharacter.setScale(2);

        // Click event on the game
        scene.input.on('pointerdown', function (pointer) {
            if (character.getBounds().contains(pointer.x, pointer.y)) {
                selectedCharacter = character;
                // Reset target coordinates when a new character is selected
                targetX = undefined;
                targetY = undefined;
            } else if (secondCharacter.getBounds().contains(pointer.x, pointer.y)) {
                selectedCharacter = secondCharacter;
                // Reset target coordinates when a new character is selected
                targetX = undefined;
                targetY = undefined;
            } else if (selectedCharacter) {
                targetX = pointer.x;
                targetY = pointer.y;
            }
        });
    };

    const update = (scene) => {
        const speed = 30; // Adjust speed as necessary
    if (targetX !== undefined && targetY !== undefined && selectedCharacter) {
        scene.physics.moveTo(selectedCharacter, targetX, targetY, speed);

        if (Phaser.Math.Distance.Between(selectedCharacter.x, selectedCharacter.y, targetX, targetY) < 10) {
            selectedCharacter.body.stop();
        }
    }

        // Update dashboard
        scoreText.setText('Score: ' + score);
        resourcesText.setText('Resources: ' + resources);
    };

    return <div id="phaser-example" />;
};

export default PhaserGame;
