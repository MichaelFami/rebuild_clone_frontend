// BuildingDashboard.js
export const createBuildingDashboard = (scene, offsetX, offsetY, dashboardWidth, buildingSize) => {
    const dashboardX = offsetX;
    const initialYOffset = 40;  // Increased initial Y-offset for the title
    const dashboardY = offsetY + initialYOffset;  
    const dashboardHeight = scene.game.config.height;
    const textOffset = 10;  // Offset for the text from the building
    // Increase the dashboard width to accommodate text
    dashboardWidth += 49;  

    // Background for the building dashboard
    scene.add.rectangle(dashboardX + dashboardWidth / 2, offsetY, dashboardWidth, dashboardHeight, 0x333333).setOrigin(0.5, 0);

    // Dashboard Title
    scene.add.text(dashboardX + dashboardWidth / 2, offsetY + 10, 'Build', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5, 0);

    const buildings = [
        { key: 'building1', label: 'Four Wheeler' },
        { key: 'building2', label: 'Armored Van' },
        { key: 'building3', label: 'Fire Station' },
        { key: 'building4', label: 'Police Station' },
        { key: 'building5', label: 'Tank' }
    ];

    buildings.forEach((building, index) => {
        let buildingGraphic;

        
            // Create an image for Building 1
            buildingGraphic = scene.add.image(
                dashboardX + dashboardWidth / 2 - 50,
                dashboardY + (index * (buildingSize + 20)) + 20,
                building.key
            ).setInteractive().setOrigin(0.5, 0.5).setScale(0.05); // Adjust scale as needed
        

        scene.add.text(
            buildingGraphic.x + buildingSize / 2 + textOffset,
            buildingGraphic.y,
            building.label,
            { fontSize: '16px', fill: '#fff' }
        ).setOrigin(0, 0.5);

        buildingGraphic.on('pointerdown', () => {
            scene.events.emit('buildingSelected', building.key);
        });
    });
};
