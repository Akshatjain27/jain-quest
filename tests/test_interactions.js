const fs = require('fs');
const assert = require('assert');

// =========================================================================
// PART 1: GAME STATE LOGIC UNIT TESTS (From Task 3 Spec)
// =========================================================================

// Simulate game state interactions
function createTestState() {
  const cards = Array.from({ length: 10 }, (_, i) => ({ id: `card_${i}`, godname: `God ${i}`, correctSign: `Sign ${i}` }));
  const slots = Array.from({ length: 10 }, (_, i) => ({ slotId: `slot_${i}`, sign: `Sign ${i}`, placedCardId: null, evalStatus: null }));
  return {
    cards,
    poolCardIds: cards.map(c => c.id),
    slots,
    submitted: false,
    score: 0
  };
}

function placeCardInSlot(state, cardId, targetSlotIndex) {
  const targetSlot = state.slots[targetSlotIndex];
  if (!targetSlot) return;

  const prevPoolIdx = state.poolCardIds.indexOf(cardId);
  const prevSlot = state.slots.find(s => s.placedCardId === cardId);
  const displacedCardId = targetSlot.placedCardId;

  if (displacedCardId === cardId) return;

  if (prevPoolIdx !== -1) {
    state.poolCardIds.splice(prevPoolIdx, 1);
  }
  if (prevSlot) {
    prevSlot.placedCardId = null;
  }

  if (displacedCardId) {
    if (prevSlot) {
      prevSlot.placedCardId = displacedCardId;
    } else {
      state.poolCardIds.push(displacedCardId);
    }
  }

  targetSlot.placedCardId = cardId;
}

function recallCard(state, cardId) {
  const prevSlot = state.slots.find(s => s.placedCardId === cardId);
  if (prevSlot) {
    prevSlot.placedCardId = null;
    if (!state.poolCardIds.includes(cardId)) {
      state.poolCardIds.push(cardId);
    }
  }
}

// Test 1: Place card in empty slot
const s1 = createTestState();
placeCardInSlot(s1, 'card_0', 3);
assert.strictEqual(s1.slots[3].placedCardId, 'card_0', 'Slot 3 should contain card_0');
assert.strictEqual(s1.poolCardIds.includes('card_0'), false, 'card_0 should be removed from pool');
assert.strictEqual(s1.poolCardIds.length, 9, 'Pool should have 9 cards left');

// Test 2: Replace slot displacing card back to pool
placeCardInSlot(s1, 'card_1', 3);
assert.strictEqual(s1.slots[3].placedCardId, 'card_1', 'Slot 3 should now contain card_1');
assert.strictEqual(s1.poolCardIds.includes('card_0'), true, 'card_0 should be returned to pool');
assert.strictEqual(s1.poolCardIds.includes('card_1'), false, 'card_1 should not be in pool');
assert.strictEqual(s1.poolCardIds.length, 9, 'Pool should still have 9 cards');

// Test 3: Swap two placed cards
placeCardInSlot(s1, 'card_2', 5);
placeCardInSlot(s1, 'card_1', 5); // move card_1 from slot 3 to slot 5 (swap with card_2)
assert.strictEqual(s1.slots[5].placedCardId, 'card_1', 'Slot 5 should have card_1');
assert.strictEqual(s1.slots[3].placedCardId, 'card_2', 'Slot 3 should have received displaced card_2');

// Test 4: Recall card
recallCard(s1, 'card_1');
assert.strictEqual(s1.slots[5].placedCardId, null, 'Slot 5 should be empty after recall');
assert.strictEqual(s1.poolCardIds.includes('card_1'), true, 'card_1 should be back in pool');
assert.strictEqual(s1.poolCardIds.length, 9, 'Pool should now have 9 cards');

// Test 5: Place all 10 cards
const s2 = createTestState();
for (let i = 0; i < 10; i++) {
  placeCardInSlot(s2, `card_${i}`, i);
}
assert.strictEqual(s2.poolCardIds.length, 0, 'Pool should be completely empty when all 10 placed');
assert.strictEqual(s2.slots.every(s => s.placedCardId !== null), true, 'All slots should have a placed card');

// Test 6: Swap between two full slots preserves full state
placeCardInSlot(s2, 'card_0', 9);
assert.strictEqual(s2.slots[9].placedCardId, 'card_0');
assert.strictEqual(s2.slots[0].placedCardId, 'card_9');
assert.strictEqual(s2.poolCardIds.length, 0, 'Pool should remain empty after slot swap');

// Test 7: Recall one card from full state
recallCard(s2, 'card_0');
assert.strictEqual(s2.slots[9].placedCardId, null);
assert.strictEqual(s2.poolCardIds.length, 1);
assert.strictEqual(s2.poolCardIds[0], 'card_0');

// =========================================================================
// PART 2: CODEBASE VERIFICATION OF jain_quest_matching_game.html
// =========================================================================

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Function existence checks
assert(html.includes('function placeCardInSlot('), 'placeCardInSlot function must be defined');
assert(html.includes('function moveCardToPool('), 'moveCardToPool function must be defined');
assert(html.includes('function updateUnplacedBadge('), 'updateUnplacedBadge function must be defined');
assert(html.includes('function renderBoard('), 'renderBoard function must be defined');
assert(html.includes('function handleTouchDrag('), 'handleTouchDrag function must be defined');
assert(html.includes('function toggleDockExpand('), 'toggleDockExpand function must be defined');

// Verification of mobile dock rendering & synchronization
assert(html.includes('mobile-dock-cards'), 'mobile-dock-cards element ID must be referenced');
assert(html.includes('dock-minimized'), 'dock-minimized class must be defined and referenced');
assert(html.includes('updateUnplacedBadge()'), 'updateUnplacedBadge must be called');
assert(html.includes('count === 0'), 'Auto-dock collapse when count === 0 must be checked');

// Verification of snap-pop animation integration
assert(html.includes('snap-pop'), 'snap-pop class must be referenced in script or style');
assert(html.includes('lastPlacedCardId'), 'lastPlacedCardId tracker must be implemented');

// Verification of 8px drag threshold
assert(/Math\.hypot\(.*?\)\s*>\s*8/.test(html) || /Math\.hypot\(.*?\)\s*>=\s*8/.test(html), 'Drag threshold of 8px must be implemented');

console.log('✅ Task 3 tests passed successfully.');
