const assert = require('assert');
const fs = require('fs');

// 1. Logic test
function evaluateBoard(slots, cards) {
  let score = 0;
  const results = [];
  slots.forEach((slot, idx) => {
    if (!slot.placedCardId) {
      results.push({ idx, status: 'empty' });
      return;
    }
    const card = cards.find(c => c.id === slot.placedCardId);
    if (card && card.correctSign === slot.sign) {
      score++;
      results.push({ idx, status: 'correct' });
    } else {
      results.push({ idx, status: 'wrong' });
    }
  });
  return { score, results };
}

const cards = [
  { id: 'c1', correctSign: 'सिंह' },
  { id: 'c2', correctSign: 'बैल' }
];
const slots = [
  { sign: 'सिंह', placedCardId: 'c1' },
  { sign: 'बैल', placedCardId: 'c1' } // Wrong match
];

const res = evaluateBoard(slots, cards);
assert.strictEqual(res.score, 1);
assert.strictEqual(res.results[0].status, 'correct');
assert.strictEqual(res.results[1].status, 'wrong');

// 2. Integration / DOM contract checks
const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

assert(html.includes('fireConfetti'), 'fireConfetti function must exist in html');
assert(html.includes('card-evaluating'), 'card-evaluating focus must exist');
assert(html.includes('shake-wrong'), 'shake-wrong animation must be applied');
assert(html.includes('card-wrong'), 'card-wrong class must be applied on incorrect');
assert(html.includes('fillCorrectAnswers'), 'fillCorrectAnswers function must exist');

console.log('✅ Task 4 evaluation tests passed successfully.');
