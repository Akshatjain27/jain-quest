const assert = require('assert');
const fs = require('fs');

const set1 = JSON.parse(fs.readFileSync('set-1.json', 'utf8'));
const set2 = JSON.parse(fs.readFileSync('set-2.json', 'utf8'));

// Verify source JSON files
assert.strictEqual(set1.length, 20, 'set-1.json must have 20 items');
assert.strictEqual(set2.length, 20, 'set-2.json must have 20 items');
assert(set1[0].question && set1[0].answer, 'Items must use {question, answer} format');
assert(set2[0].question && set2[0].answer, 'Items must use {question, answer} format');

// Verify HTML integration
const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');
assert(html.includes('SET_1_SOURCE'), 'HTML must contain SET_1_SOURCE');
assert(html.includes('SET_2_SOURCE'), 'HTML must contain SET_2_SOURCE');
assert(html.includes('item.question'), 'Card creation must reference item.question');
assert(html.includes('item.answer'), 'Slot creation must reference item.answer');

console.log('✅ Task 1: Set 1 & Set 2 schema and slicing tests passed.');
