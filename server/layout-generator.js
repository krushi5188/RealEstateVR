// server/layout-generator.js

const WALL_CLEARANCE = 24; // inches from wall
const PATHWAY_CLEARANCE = 36; // inches for major pathways
const COFFEE_TABLE_DISTANCE = 18; // inches from seating

/**
 * New, more robust, rule-based procedural layout generator.
 * @param {object} layoutRequest - Contains room geometry and a list of furniture.
 * @returns {object} An object containing a list of generated layouts.
 */
function generateLayouts(layoutRequest) {
    const { room, furniture } = layoutRequest;
    if (!room || !room.bounds || furniture.length === 0) {
        return { layouts: [] };
    }

    // Use room's actual bounding box, assuming origin is at minX, minY
    const roomWidth = room.bounds.maxX - room.bounds.minX;
    const roomDepth = room.bounds.maxY - room.bounds.minY;
    const roomCenter = { x: roomWidth / 2, z: roomDepth / 2 };

    const sortedFurniture = [...furniture].sort((a, b) => (b.dimensions.width * b.dimensions.depth) - (a.dimensions.width * a.dimensions.depth));
    const layouts = [];

    // --- Layout 1: Conversational, Centered ---
    const layout1 = [];
    const mainSofa = sortedFurniture.find(f => f.subCategory === 'Sofa');
    if (mainSofa) {
        const sofa = { ...mainSofa, rotation: 0 };
        sofa.position = { x: roomCenter.x, y: 0, z: sofa.dimensions.depth / 2 + WALL_CLEARANCE };
        layout1.push(sofa);

        const coffeeTable = sortedFurniture.find(f => f.subCategory === 'Coffee Table');
        if (coffeeTable) {
            const table = { ...coffeeTable, rotation: 0 };
            table.position = { x: roomCenter.x, y: 0, z: sofa.position.z + sofa.dimensions.depth / 2 + COFFEE_TABLE_DISTANCE + table.dimensions.depth / 2 };
            layout1.push(table);
        }

        const sideChairs = sortedFurniture.filter(f => f.subCategory === 'Armchair').slice(0, 2);
        if (sideChairs.length > 0) {
            const chair1 = { ...sideChairs[0], rotation: -90 };
            chair1.position = { x: roomCenter.x - sofa.dimensions.width / 2 - chair1.dimensions.depth/2 - PATHWAY_CLEARANCE, y: 0, z: roomCenter.z};
            layout1.push(chair1);
            if (sideChairs.length > 1) {
                const chair2 = { ...sideChairs[1], rotation: 90 };
                chair2.position = { x: roomCenter.x + sofa.dimensions.width / 2 + chair2.dimensions.depth/2 + PATHWAY_CLEARANCE, y: 0, z: roomCenter.z};
                layout1.push(chair2);
            }
        }
    }
     if (validateLayout(layout1, roomWidth, roomDepth)) {
        layouts.push({ name: 'Conversational', furniture: layout1 });
    }

    // --- Layout 2: Open Plan, Along the Walls ---
    const layout2 = [];
    if (mainSofa) {
        const sofa = { ...mainSofa, rotation: 0 };
        sofa.position = { x: roomCenter.x, y: 0, z: sofa.dimensions.depth / 2 + WALL_CLEARANCE };
        layout2.push(sofa);

        const sideChairs = sortedFurniture.filter(f => f.subCategory === 'Armchair').slice(0, 2);
        if(sideChairs.length > 0) {
            const chair1 = { ...sideChairs[0], rotation: 0 };
            chair1.position = {x: chair1.dimensions.width / 2 + WALL_CLEARANCE, y: 0, z: roomCenter.z};
            layout2.push(chair1);
            if(sideChairs.length > 1) {
                 const chair2 = { ...sideChairs[1], rotation: 180 };
                 chair2.position = {x: roomWidth - chair2.dimensions.width / 2 - WALL_CLEARANCE, y: 0, z: roomCenter.z};
                 layout2.push(chair2);
            }
        }
    }
     if (validateLayout(layout2, roomWidth, roomDepth)) {
        layouts.push({ name: 'Open Plan', furniture: layout2 });
    }


    return { layouts };
}

function getBoundingBox(item) {
    const w = item.rotation === 90 || item.rotation === -90 ? item.dimensions.depth : item.dimensions.width;
    const d = item.rotation === 90 || item.rotation === -90 ? item.dimensions.width : item.dimensions.depth;
    return {
        minX: item.position.x - w / 2,
        maxX: item.position.x + w / 2,
        minZ: item.position.z - d / 2,
        maxZ: item.position.z + d / 2,
    };
}

function validateLayout(furniture, roomWidth, roomDepth) {
    if (furniture.length === 0) return false;

    const boxes = furniture.map(getBoundingBox);

    // Rule 1: Check if any item is out of bounds
    for (const box of boxes) {
        if (box.minX < 0 || box.maxX > roomWidth || box.minZ < 0 || box.maxZ > roomDepth) {
            return false;
        }
    }

    // Rule 2: Check for overlaps between items
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
            const box1 = boxes[i];
            const box2 = boxes[j];
            const overlap = !(box1.maxX < box2.minX || box1.minX > box2.maxX || box1.maxZ < box2.minZ || box1.minZ > box2.maxZ);
            if (overlap) {
                return false;
            }
        }
    }

    return true;
}

module.exports = { generateLayouts };
