import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene.jsx';

const PhaserGame = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 1100,
            height: 800,
            parent: 'phaser-canvas',
            scene: [GameScene],
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true
                }
            }
        };

        const game = new Phaser.Game(config);

        // Fetch leaderboard data
        const fetchLeaderboardData = async () => {
            try {
                const response = await fetch('http://localhost:3001/topscores');
                const data = await response.json();
                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };

        fetchLeaderboardData();

        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div className="game-container">
            <div id="leaderboard">
                <h2>Leaderboard</h2>
                <ul>
                    {leaderboard.map((entry, index) => (
                        <li key={index}>{entry.username}: {entry.score}</li>
                    ))}
                </ul>
            </div>
            <div id="phaser-canvas" />
        </div>
    );
};

export default PhaserGame;
