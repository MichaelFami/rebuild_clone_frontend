// PhaserGame.js
import React, { useEffect } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene.jsx';

const PhaserGame = () => {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 900,
            height: 900,
            parent: 'phaser-example',
            scene: [GameScene],
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

    return <div id="phaser-example" />;
};

export default PhaserGame;
