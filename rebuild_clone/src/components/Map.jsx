import  { useState, useEffect } from 'react';
import Tile from './Tile'; // Import the Tile component

const Map = ({ width, height }) => {
    // Initialize the map with default tile types
    const createInitialMap = () => {
        let initialMap = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                // Assign different types based on position, randomness, or predefined layout
                let type = 'empty';
                if (x % 2 === 0 && y % 2 === 0) {
                    type = 'building';
                } else if (x % 2 === 1) {
                    type = 'road';
                }
                row.push({ type });
            }
            initialMap.push(row);
        }
        return initialMap;
    };

    const [mapTiles, setMapTiles] = useState(createInitialMap());

    // Function to handle tile click
    const handleTileClick = (x, y) => {
        // Update the map state on tile click
        // Example: change tile type, toggle state, etc.
    };

    return (
        <div className="map">
            {mapTiles.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((tile, colIndex) => (
                        <Tile 
                            key={`${rowIndex}-${colIndex}`}
                            type={tile.type}
                            onClick={() => handleTileClick(rowIndex, colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};


export default Map;
