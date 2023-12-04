// BuildingDashboard.js
export const createBuildingDashboard = (scene, offsetX, offsetY, dashboardWidth, buildingSize) => {
    const dashboardX = offsetX;
    const initialYOffset = 40;  // Increased initial Y-offset for the title
    const dashboardY = offsetY + initialYOffset;  
    const dashboardHeight = scene.game.config.height;
    const textOffset = 10;  // Offset for the text from the building

    // Increase the dashboard width to accommodate text
    dashboardWidth += 100;  

    // Background for the building dashboard
    scene.add.rectangle(dashboardX + dashboardWidth / 2, offsetY, dashboardWidth, dashboardHeight, 0x333333).setOrigin(0.5, 0);

    // Dashboard Title
    scene.add.text(dashboardX + dashboardWidth / 2, offsetY + 10, 'Build', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5, 0);

    const buildings = [
        { color: 0xff0000, key: 'building1', label: 'Building 1' },
        { color: 0x00ff00, key: 'building2', label: 'Building 2' },
        { color: 0x0000ff, key: 'building3', label: 'Building 3' },
        { color: 0xffff00, key: 'building4', label: 'Building 4' },
        { color: 0xff00ff, key: 'building5', label: 'Building 5' }
    ];

    buildings.forEach((building, index) => {
        let buildingGraphic = scene.add.rectangle(
            dashboardX + dashboardWidth / 2 - 50,  
            dashboardY + (index * (buildingSize + 20)) + 20, 
            buildingSize,
            buildingSize,
            building.color
        ).setInteractive().setOrigin(0.5, 0.5);

        scene.add.text(
            buildingGraphic.x + buildingSize / 2 + textOffset,
            buildingGraphic.y,
            building.label,
            { fontSize: '16px', fill: '#fff' }
        ).setOrigin(0, 0.5);

        buildingGraphic.on('pointerdown', () => {
            // Emit an event with the selected building key
            scene.events.emit('buildingSelected', building.key);
        });
    });
};
