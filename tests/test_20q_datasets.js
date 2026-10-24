const fs = require('fs');
const assert = require('assert');

// 1. Test dataset structure from stub
const {
  SET_1_VIDEO_COMBINED,
  SET_2_CANONICAL,
  SET_3_AUTHENTIC_MIX,
  GAME_SETS_20,
  pickRandomGameSet20
} = require('./dataset_20q_stub.js');

assert(Array.isArray(GAME_SETS_20), 'GAME_SETS_20 must be an array');
assert(GAME_SETS_20.length >= 3, 'Must have at least 3 complete 20-question sets');

GAME_SETS_20.forEach((set, idx) => {
  assert(set.id, `Set ${idx} must have an id`);
  assert(set.name, `Set ${idx} must have a name`);
  assert(Array.isArray(set.page1) && set.page1.length === 10, `Set ${idx} page1 must contain exactly 10 questions`);
  assert(Array.isArray(set.page2) && set.page2.length === 10, `Set ${idx} page2 must contain exactly 10 questions`);

  set.page1.forEach(item => {
    assert(typeof item.godname === 'string' && item.godname.length > 0);
    assert(typeof item.sign === 'string' && item.sign.length > 0);
  });
  set.page2.forEach(item => {
    assert(typeof item.godname === 'string' && item.godname.length > 0);
    assert(typeof item.sign === 'string' && item.sign.length > 0);
  });

  // Verify all 20 questions in the set are unique
  const allGods = [...set.page1.map(i => i.godname), ...set.page2.map(i => i.godname)];
  const uniqueGods = new Set(allGods);
  assert.strictEqual(uniqueGods.size, 20, `Set ${set.id} must contain 20 unique Tirthankaras across page 1 and page 2`);
});

// 2. Test pickRandomGameSet20 picker
const picked = pickRandomGameSet20();
assert(picked && picked.page1 && picked.page2, 'pickRandomGameSet20 must return a valid set');
assert.strictEqual(picked.page1.length, 10);
assert.strictEqual(picked.page2.length, 10);

// Test non-consecutive picker with excludeId
const pickedExclude = pickRandomGameSet20(GAME_SETS_20[0].id);
assert.notStrictEqual(pickedExclude.id, GAME_SETS_20[0].id, 'pickRandomGameSet20 must exclude specified id when alternatives exist');

// 3. Test jain_quest_matching_game.html integration
const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');
assert(html.includes('SET_1_VIDEO_COMBINED'), 'HTML must include SET_1_VIDEO_COMBINED');
assert(html.includes('SET_2_CANONICAL'), 'HTML must include SET_2_CANONICAL');
assert(html.includes('SET_3_AUTHENTIC_MIX'), 'HTML must include SET_3_AUTHENTIC_MIX');
assert(html.includes('GAME_SETS_20'), 'HTML must include GAME_SETS_20');
assert(html.includes('pickRandomGameSet20'), 'HTML must include pickRandomGameSet20');
assert(html.includes('activeSet:'), 'HTML gameState must include activeSet property');
assert(html.includes('currentPage:'), 'HTML gameState must include currentPage property');

console.log('✅ Task 1: 20-Question Datasets Engine tests passed.');
