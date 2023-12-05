import  { useEffect } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene.jsx';

const PhaserGame = () => {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 1400,
            height: 800,
            parent: 'phaser-example',
            scene: [GameScene],
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true
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
