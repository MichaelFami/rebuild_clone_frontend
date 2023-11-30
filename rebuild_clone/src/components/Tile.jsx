
const Tile = ({ type, onClick }) => {
    // Function to determine the class name based on the tile type
    const getClassName = (type) => {
        let baseClass = "tile";
        switch(type) {
            case 'building': 
                return `${baseClass} building`;
            case 'road': 
                return `${baseClass} road`;
            default: 
                return `${baseClass} empty`;
        }
    };

    // Function to determine the content to be displayed in the tile
    const getContent = (type) => {
        switch(type) {
            case 'building': 
                return <span>🏢</span>; // Example: use an emoji or an image
            case 'road': 
                return <span>🛣️</span>; // Example: use an emoji or an image
            default: 
                return <span>🌿</span>; // Example: use an emoji or an image
        }
    };

    return (
        <div className={getClassName(type)} onClick={onClick}>
            {getContent(type)}
        </div>
    );
};

export default Tile;

// Add your CSS here or in a separate file
// Example CSS:
// .tile { width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; }
// .building { background-color: grey; }
// .road { background-color: black; }
// .empty { background-color: green; }
