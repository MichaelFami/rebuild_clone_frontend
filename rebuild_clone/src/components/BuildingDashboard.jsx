// BuildingDashboard.js
const createBuildingDashboard = (scene, offsetX, offsetY, dashboardWidth, buildingSize) => {
    const dashboardX = offsetX;
    const dashboardY = offsetY;
    const dashboardHeight = scene.game.config.height;
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]; // Different colors for each building

    // Background for the building dashboard
    scene.add.rectangle(dashboardX, dashboardY, dashboardWidth, dashboardHeight, 0x333333).setOrigin(0, 0);

    // Building options
    for (let i = 0; i < 5; i++) {
        scene.add.rectangle(
            dashboardX + dashboardWidth / 2, // Center in the dashboard
            dashboardY + (i * (buildingSize + 10)) + 10, // Position each building option
            buildingSize,
            buildingSize,
            colors[i]
        ).setOrigin(0.5, 0); // Center horizontally
    }
};

export default createBuildingDashboard;
