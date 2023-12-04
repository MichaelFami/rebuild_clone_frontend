import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_SPACING } from './Config';
export function createPlayerHQ(scene) {
    let playerHQ = scene.add.rectangle(
        (GRID_WIDTH / 2 - 1) * CELL_SIZE, 
        (GRID_HEIGHT - 5) * CELL_SIZE,    
        2 * CELL_SIZE,     
        2 * CELL_SIZE,     
        0xff0000                          
    ).setOrigin(0, 0);
    playerHQ.health = 500;
    return playerHQ;
}
