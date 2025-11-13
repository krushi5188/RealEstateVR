// server/layout-generator.js

// --- Placement Rules & Constants ---
const INCH_TO_FEET = 1 / 12;
const WALL_CLEARANCE = 36; // inches
const PATHWAY_CLEARANCE = 30; // inches
const CONVERSATION_MIN = 48; // inches
const CONVERSATION_MAX = 120; // inches
const COFFEE_TABLE_DISTANCE = 18; // inches from seating

/**
 * A more robust, rule-based procedural layout generator.
 * @param {object} layoutRequest - Contains room dimensions and a list of furniture.
 * @returns {object[]} A list of generated layouts.
 */
function generateLayouts(layoutRequest) {
    const { room, furniture } = layoutRequest;
    const roomWidth = room.bounds.maxX - room.bounds.minX;
    const roomDepth = room.bounds.maxY - room.bounds.minY;

    // 1. Sort furniture by size (largest first)
    const sortedFurniture = [...furniture].sort((a, b) => (b.dimensions.width * b.dimensions.depth) - (a.dimensions.width * a.dimensions.depth));

    const anchorPiece = sortedFurniture.find(f => f.category === 'Seating');
    const otherSeating = sortedFurniture.filter(f => f.category === 'Seating' && f.id !== anchorPiece.id);
    const tables = sortedFurniture.filter(f => f.category === 'Tables');

    if (!anchorPiece) return { layouts: [] };

    const layouts = [];

    // --- Generate Layout 1: Centered on Longest Wall ---
    const layout1 = [];
    const focalWall = roomWidth > roomDepth ? 'depth' : 'width';

    if (focalWall === 'depth') {
        // Place anchor along the back wall
        anchorPiece.position = { x: roomWidth / 2, y: 0, z: anchorPiece.dimensions.depth / 2 + WALL_CLEARANCE };
        anchorPiece.rotation = 0;
        layout1.push(anchorPiece);

        // Place other seating opposite
        let currentX = roomWidth / 2 - (otherSeating.reduce((sum, s) => sum + s.dimensions.width, 0) / 2);
        for (const seat of otherSeating) {
            seat.position = { x: currentX, y: 0, z: roomDepth - seat.dimensions.depth / 2 - WALL_CLEARANCE };
            seat.rotation = 180;
            layout1.push(seat);
            currentX += seat.dimensions.width + PATHWAY_CLEARANCE;
        }
    } else {
        // Place anchor along the side wall
        anchorPiece.position = { x: anchorPiece.dimensions.depth / 2 + WALL_CLEARANCE, y: 0, z: roomDepth / 2 };
        anchorPiece.rotation = 90;
        layout1.push(anchorPiece);

        // Place other seating opposite
        let currentZ = roomDepth / 2 - (otherSeating.reduce((sum, s) => sum + s.dimensions.width, 0) / 2);
        for (const seat of otherSeating) {
            seat.position = { x: roomWidth - seat.dimensions.depth / 2 - WALL_CLEARANCE, y: 0, z: currentZ };
            seat.rotation = -90;
            layout1.push(seat);
            currentZ += seat.dimensions.width + PATHWAY_CLEARANCE;
        }
    }

    // Place coffee table in the middle
    const coffeeTable = tables.find(t => t.subCategory === 'Coffee Table');
    if (coffeeTable) {
        coffeeTable.position = { x: roomWidth / 2, y: 0, z: roomDepth / 2 };
        coffeeTable.rotation = 0;
        layout1.push(coffeeTable);
    }

    // Validate and add layout
    if (validateLayout(layout1, roomWidth, roomDepth)) {
        layouts.push({ name: 'Focal Point', furniture: layout1 });
    }

    // --- Generate Layout 2: Rotated 90 degrees ---
    const layout2 = layout1.map(item => ({
        ...item,
        position: { x: item.position.z, y: item.position.y, z: item.position.x },
        rotation: item.rotation - 90,
    }));

    if (validateLayout(layout2, roomWidth, roomDepth)) {
        layouts.push({ name: 'Focal Point (Rotated)', furniture: layout2 });
    }


    return { layouts };
}

function validateLayout(furniture, roomWidth, roomDepth) {
    for (const item of furniture) {
        const halfWidth = item.dimensions.width / 2;
        const halfDepth = item.dimensions.depth / 2;
        if (
            item.position.x - halfWidth < 0 ||
            item.position.x + halfWidth > roomWidth ||
            item.position.z - halfDepth < 0 ||
            item.position.z + halfDepth > roomDepth
        ) {
            return false; // Item is out of bounds
        }
    }
    // Basic validation, doesn't check for overlaps yet.
    return true;
}


module.exports = { generateLayouts };
