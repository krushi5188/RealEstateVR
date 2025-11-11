// server/test-biophilic-analyzer.js
const assert = require('assert');
const { analyzeBiophilicDesign } = require('./biophilic-analyzer');

async function runTests() {
  console.log('Running tests for biophilic-analyzer.js...');

  // Test case 1: Basic model data
  const modelData1 = {
    vertices: [0,0,0, 10,0,0, 10,10,0, 0,10,0],
    faces: [0,1,2, 0,2,3],
    rooms: [{id: 0, center: {x: 5, y: 5}}],
    windows: [{x1: 0, y1: 0, x2: 10, y2: 0}]
  };
  const report1 = await analyzeBiophilicDesign(modelData1);
  assert.strictEqual(typeof report1.report.overallBiophilicScore, 'number', 'Test Case 1 Failed: overallBiophilicScore should be a number');
  assert(report1.report.overallBiophilicScore >= 0 && report1.report.overallBiophilicScore <= 100, 'Test Case 1 Failed: overallBiophilicScore should be between 0 and 100');
  console.log('Test Case 1 Passed.');

  // Test case 2: No windows
    const modelData2 = {
    vertices: [0,0,0, 10,0,0, 10,10,0, 0,10,0],
    faces: [0,1,2, 0,2,3],
    rooms: [{id: 0, center: {x: 5, y: 5}}],
    windows: []
    };
    const report2 = await analyzeBiophilicDesign(modelData2);
    assert.strictEqual(report2.report.overallBiophilicScore, 0, 'Test Case 2 Failed: Score should be 0 with no windows');
    console.log('Test Case 2 Passed.');


  console.log('All tests passed for biophilic-analyzer.js!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
