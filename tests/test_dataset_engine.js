const fs = require('fs');
const assert = require('assert');

// Simulate the engine module
const {
  DATASET_REGISTRY,
  pickRandomDataset,
  validateDataset,
  registerCustomDataset
} = require('./dataset_engine_stub.js');

// Test 1: Built-in datasets exist and have 10 valid items
assert(Array.isArray(DATASET_REGISTRY), 'DATASET_REGISTRY should be an array');
assert(DATASET_REGISTRY.length >= 3, 'Should have at least 3 default datasets (Set 1, Set 2, Authentic)');

DATASET_REGISTRY.forEach(ds => {
  assert(ds.name && typeof ds.name === 'string', 'Dataset must have a name');
  assert(Array.isArray(ds.items) && ds.items.length === 10, `${ds.name} must contain exactly 10 items`);
  ds.items.forEach(item => {
    assert(item.godname && typeof item.godname === 'string', 'Item must have godname');
    assert(item.sign && typeof item.sign === 'string', 'Item must have sign');
  });
});

// Test 2: Random picker returns valid dataset
const randomDs = pickRandomDataset();
assert(randomDs && randomDs.name && Array.isArray(randomDs.items), 'pickRandomDataset must return valid dataset');
assert.strictEqual(randomDs.items.length, 10, 'Selected dataset must have 10 items');

// Test 3: Validation helper rejects invalid structures
assert.strictEqual(validateDataset([]), false);
assert.strictEqual(validateDataset([{ godname: 'Test' }]), false);
assert.strictEqual(validateDataset([{ godname: 'Test', sign: 'Sign' }]), true);

// Test 4: Custom dataset registration
const customItems = Array.from({ length: 10 }, (_, i) => ({ godname: `God ${i}`, sign: `Sign ${i}` }));
assert.strictEqual(registerCustomDataset('My Custom Set', customItems), true);
assert(DATASET_REGISTRY.some(ds => ds.name === 'My Custom Set'), 'My Custom Set should be registered');
assert.strictEqual(registerCustomDataset('Invalid Set', [{ godname: 'Only one' }]), false);

// Test 5: Verify jain_quest_matching_game.html integration
const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');
assert(html.includes('DATASET_REGISTRY'), 'jain_quest_matching_game.html must include DATASET_REGISTRY');
assert(html.includes('pickRandomDataset'), 'jain_quest_matching_game.html must include pickRandomDataset');
assert(html.includes('validateDataset'), 'jain_quest_matching_game.html must include validateDataset');
assert(html.includes('registerCustomDataset'), 'jain_quest_matching_game.html must include registerCustomDataset');

console.log('✅ Task 1 tests passed successfully.');
