const assert = require('assert');
const { createGrid, findPath, GridNode } = require('./path-analyzer');

function runTests() {
  console.log('Running Path Analyzer Tests...');

  // --- Test Case 1: Grid Creation ---
  const wallData = {
    width: 100,
    height: 100,
    walls: [{ x1: 50, y1: 0, x2: 50, y2: 100 }], // Vertical wall
  };
  const grid = createGrid(wallData, 0.1); // 10x10 grid
  assert.strictEqual(grid.length, 10, 'Test Case 1 Failed: Grid height should be 10.');
  assert.strictEqual(grid[0].length, 10, 'Test Case 1 Failed: Grid width should be 10.');
  assert.strictEqual(grid[5][5].isWall, true, 'Test Case 1 Failed: Cell [5][5] should be a wall.');
  assert.strictEqual(grid[4][5].isWall, true, 'Test Case 1 Failed: Cell [4][5] should be a wall.');
  assert.strictEqual(grid[5][4].isWall, false, 'Test Case 1 Failed: Cell [5][4] should not be a wall.');
  console.log('✓ Test Case 1 Passed: Grid creation.');

  // --- Test Case 2: Simple Straight Path ---
  const emptyGrid = Array(20).fill(null).map((_, y) => Array(20).fill(null).map((_, x) => new GridNode(x, y)));
  let startNode = emptyGrid[5][5];
  let endNode = emptyGrid[5][15];
  let path = findPath(emptyGrid, startNode, endNode);
  assert.strictEqual(path.length, 11, 'Test Case 2 Failed: Path length should be 11.');
  console.log('✓ Test Case 2 Passed: Simple straight path.');

  // --- Test Case 3: Path around an obstacle ---
  // Reset grid and nodes
  const blockedGrid = Array(20).fill(null).map((_, y) => Array(20).fill(null).map((_, x) => new GridNode(x, y)));
  for(let i = 4; i <= 16; i++) {
    blockedGrid[i][10].isWall = true; // Create a vertical wall
  }
  startNode = blockedGrid[10][5];
  endNode = blockedGrid[10][15];
  path = findPath(blockedGrid, startNode, endNode);
  assert.ok(path.length > 11, 'Test Case 3 Failed: Path should be longer to go around the wall.');
  console.log('✓ Test Case 3 Passed: Pathfinding around an obstacle.');

  // --- Test Case 4: No path found ---
  const trappedGrid = Array(20).fill(null).map((_, y) => Array(20).fill(null).map((_, x) => new GridNode(x, y)));
  for(let i = 0; i < 20; i++) {
    trappedGrid[i][10].isWall = true; // Create an inescapable wall
  }
  startNode = trappedGrid[5][5];
  endNode = trappedGrid[5][15];
  path = findPath(trappedGrid, startNode, endNode);
  assert.strictEqual(path.length, 0, 'Test Case 4 Failed: Should not find a path.');
  console.log('✓ Test Case 4 Passed: No path found.');

  console.log('\nAll tests passed!');
}

try {
  runTests();
} catch (error) {
  console.error('\nTest failed:', error.message);
  process.exit(1);
}
