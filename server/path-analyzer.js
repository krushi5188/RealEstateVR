// server/path-analyzer.js

/**
 * Represents a node in the pathfinding grid.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {boolean} isWall - True if the node is an obstacle.
 */
class GridNode {
  constructor(x, y, isWall = false) {
    this.x = x;
    this.y = y;
    this.isWall = isWall;
    this.gCost = Infinity; // Cost from the start node
    this.hCost = 0;        // Heuristic cost to the end node
    this.fCost = Infinity; // Total cost (gCost + hCost)
    this.parent = null;    // Parent node in the path
  }
}

/**
 * Converts raw wall data into a 2D grid representation for pathfinding.
 * @param {object} wallData - The wall data from the image processor.
 * @param {number} resolution - The number of grid cells per unit of original image dimension.
 * @returns {GridNode[][]} The 2D grid.
 */
function createGrid(wallData, resolution = 0.1) {
  const gridWidth = Math.ceil(wallData.width * resolution);
  const gridHeight = Math.ceil(wallData.height * resolution);

  // 1. Initialize an empty grid
  const grid = Array(gridHeight).fill(null).map((_, y) =>
    Array(gridWidth).fill(null).map((_, x) => new GridNode(x, y))
  );

  // 2. Draw walls onto the grid
  for (const wall of wallData.walls) {
    const x1 = Math.floor(wall.x1 * resolution);
    const y1 = Math.floor(wall.y1 * resolution);
    const x2 = Math.floor(wall.x2 * resolution);
    const y2 = Math.floor(wall.y2 * resolution);

    // Simple line drawing algorithm (horizontal or vertical lines)
    if (x1 === x2) { // Vertical line
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        if (grid[y] && grid[y][x1]) {
          grid[y][x1].isWall = true;
        }
      }
    } else { // Horizontal line
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        if (grid[y1] && grid[y1][x]) {
          grid[y1][x].isWall = true;
        }
      }
    }
  }

  return grid;
}

/**
 * Identifies key nodes (e.g., doorways) on the grid.
 * @param {GridNode[][]} grid - The pathfinding grid.
 * @returns {GridNode[]} An array of key nodes.
 */
function identifyKeyNodes(grid) {
  // Placeholder: This will later identify doors from model data.
  console.log('Placeholder for identifyKeyNodes');
  // For now, returns dummy nodes.
  return [grid[10][10], grid[40][40], grid[10][40]];
}

/**
 * Calculates the heuristic distance between two nodes (Manhattan distance).
 * @param {GridNode} a - The first node.
 * @param {GridNode} b - The second node.
 * @returns {number} The distance.
 */
function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Reconstructs the path from the end node back to the start.
 * @param {GridNode} endNode - The node where the path ended.
 * @returns {GridNode[]} The reconstructed path.
 */
function reconstructPath(endNode) {
  const path = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    path.push(currentNode);
    currentNode = currentNode.parent;
  }
  return path.reverse();
}

/**
 * Implements the A* pathfinding algorithm.
 * @param {GridNode[][]} grid - The grid to search on.
 * @param {GridNode} startNode - The starting node.
 * @param {GridNode} endNode - The target node.
 * @returns {GridNode[]} The path from start to end, or an empty array if no path is found.
 */
function findPath(grid, startNode, endNode) {
  const openList = [];
  const closedList = new Set();

  startNode.gCost = 0;
  startNode.hCost = getDistance(startNode, endNode);
  startNode.fCost = startNode.gCost + startNode.hCost;
  openList.push(startNode);

  while (openList.length > 0) {
    // Get the node with the lowest fCost
    openList.sort((a, b) => a.fCost - b.fCost);
    const currentNode = openList.shift();

    if (currentNode === endNode) {
      return reconstructPath(endNode);
    }

    closedList.add(currentNode);

    // Get neighbors
    const neighbors = [];
    const { x, y } = currentNode;
    if (grid[y - 1] && grid[y - 1][x]) neighbors.push(grid[y - 1][x]);
    if (grid[y + 1] && grid[y + 1][x]) neighbors.push(grid[y + 1][x]);
    if (grid[y] && grid[y][x - 1]) neighbors.push(grid[y][x - 1]);
    if (grid[y] && grid[y][x + 1]) neighbors.push(grid[y][x + 1]);

    for (const neighbor of neighbors) {
      if (neighbor.isWall || closedList.has(neighbor)) {
        continue;
      }

      const tentativeGCost = currentNode.gCost + getDistance(currentNode, neighbor);

      if (tentativeGCost < neighbor.gCost) {
        neighbor.parent = currentNode;
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = getDistance(neighbor, endNode);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;

        if (!openList.some(node => node === neighbor)) {
          openList.push(neighbor);
        }
      }
    }
  }

  // No path found
  return [];
}

/**
 * Main function to analyze circulation paths.
 * @param {object} modelData - The model data containing wall information.
 * @returns {object} An object containing the analysis results.
 */
function analyzeCirculation(modelData) {
  const grid = createGrid(modelData.wallData);
  const keyNodes = identifyKeyNodes(grid);
  const paths = [];

  // Find paths between all pairs of key nodes
  for (let i = 0; i < keyNodes.length; i++) {
    for (let j = i + 1; j < keyNodes.length; j++) {
      const path = findPath(grid, keyNodes[i], keyNodes[j]);
      if (path.length > 0) {
        paths.push(path);
      }
    }
  }

  return {
    grid,
    keyNodes,
    paths,
    // Later, we will add analysis of path properties (width, turns, etc.)
  };
}

module.exports = { analyzeCirculation, createGrid, findPath, identifyKeyNodes, GridNode }; // Exporting for tests
