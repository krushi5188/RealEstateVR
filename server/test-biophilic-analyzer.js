// server/test-biophilic-analyzer.js
const assert = require('assert');
const { analyzeBiophilicDesign } = require('./biophilic-analyzer');

async function runTests() {
  console.log('Running tests for biophilic-analyzer.js...');

  // Test case 1: Basic model data
  const modelData1 = {
    vertices: new Array(100).fill(0),
    faces: new Array(50).fill(0),
  };
  const report1 = await analyzeBiophilicDesign(modelData1);
  assert.strictEqual(typeof report1.report.biophilicScore, 'number', 'Test Case 1 Failed: biophilicScore should be a number');
  assert(report1.report.biophilicScore >= 0 && report1.report.biophilicScore <= 100, 'Test Case 1 Failed: biophilicScore should be between 0 and 100');
  console.log('Test Case 1 Passed.');

  // Test case 2: Model data with different complexity
  const modelData2 = {
    vertices: new Array(200).fill(0),
    faces: new Array(100).fill(0),
  };
  const report2 = await analyzeBiophilicDesign(modelData2);
  assert.notStrictEqual(report1.report.biophilicScore, report2.report.biophilicScore, 'Test Case 2 Failed: Scores should be different for different models');
  console.log('Test Case 2 Passed.');

  // Test case 3: Null model data
  const report3 = await analyzeBiophilicDesign(null);
  assert.strictEqual(typeof report3.report.biophilicScore, 'number', 'Test Case 3 Failed: biophilicScore should be a number even for null data');
  console.log('Test Case 3 Passed.');

  console.log('All tests passed for biophilic-analyzer.js!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
