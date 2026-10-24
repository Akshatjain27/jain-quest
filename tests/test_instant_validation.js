const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Static Contract Verifications
assert(html.includes('handleSlotAssignment') || html.includes('placeCardInSlot'), 'Must have assignment function');
assert(html.includes('handleSlotAssignment'), 'handleSlotAssignment must be explicitly defined');
assert(html.includes('handlePageComplete'), 'handlePageComplete callback must be defined');

// Verify Helper Banner Update
assert(!html.includes('id="helper-banner"'), 'Helper banner must be removed from playfield');
assert(!html.includes('id="submit-btn"'), 'submit-btn must be removed');
// Banner content check removed as banner is obsolete
// Submit answers checked above
assert(!html.includes('फिर Submit Answers दबाएँ'), 'Helper banner must not mention Submit Answers');
// Instant validation verified via gameplay mechanics

// 2. Unit logic simulation (from Task 4 brief contract)
function handleAssignment(state, cardId, slotIndex) {
  const card = state.cards.find(c => c.id === cardId);
  const slot = state.slots[slotIndex];
  if (!card || !slot || slot.placedCardId) return;

  if ((card.correctAnswer || card.correctSign) === (slot.answer || slot.sign)) {
    slot.placedCardId = card.id;
    slot.evalStatus = 'correct';
    state.score++;
    const poolIdx = state.poolCardIds.indexOf(card.id);
    if (poolIdx !== -1) state.poolCardIds.splice(poolIdx, 1);
    return { status: 'correct' };
  } else {
    state.lives--;
    return { status: 'wrong', livesRemaining: state.lives };
  }
}

const state = {
  cards: [{ id: 'c1', question: 'ऋषभदेव जी', correctAnswer: 'बैल', correctSign: 'बैल' }, { id: 'c2', question: 'अजितनाथ जी', correctAnswer: 'हाथी', correctSign: 'हाथी' }],
  slots: [{ answer: 'बैल', sign: 'बैल', placedCardId: null }, { answer: 'घोड़ा', sign: 'घोड़ा', placedCardId: null }],
  poolCardIds: ['c1', 'c2'],
  score: 0,
  lives: 3
};

// Test correct placement
const r1 = handleAssignment(state, 'c1', 0);
assert.strictEqual(r1.status, 'correct');
assert.strictEqual(state.score, 1);
assert.strictEqual(state.slots[0].placedCardId, 'c1');
assert.strictEqual(state.lives, 3);

// Test wrong placement
state.slots[1].sign = 'सिंह'; state.slots[1].answer = 'सिंह';
const r2 = handleAssignment(state, 'c2', 1);
assert.strictEqual(r2.status, 'wrong');
assert.strictEqual(state.lives, 2);
assert.strictEqual(state.slots[1].placedCardId, null); // card bounces back, not locked

// 3. VM Sandbox Execution of HTML script
class MockElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
    this.dataset = {};
    this.classList = {
      _classes: new Set(),
      add(...c) { c.forEach(cls => this._classes.add(cls)); },
      remove(...c) { c.forEach(cls => this._classes.delete(cls)); },
      contains(cls) { return this._classes.has(cls); }
    };
    this.parentElement = {
      classList: {
        add: () => {},
        remove: () => {}
      }
    };
  }
  addEventListener() {}
  removeEventListener() {}
  appendChild() {}
}

const domElements = {
  'countdown-timer': new MockElement('countdown-timer'),
  'lifelines-container': new MockElement('lifelines-container'),
  'page-indicator': new MockElement('page-indicator'),
  'score-display': new MockElement('score-display'),
  'left-pool-grid': new MockElement('left-pool-grid'),
  'right-targets-grid': new MockElement('right-targets-grid'),
  'mobile-dock-cards': new MockElement('mobile-dock-cards'),
  'unplaced-badge': new MockElement('unplaced-badge'),
  'gameover-modal': new MockElement('gameover-modal')
};

const domSandbox = {
  console,
  document: {
    getElementById: (id) => domElements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => new MockElement(tag),
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  window: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  setInterval,
  clearInterval,
  setTimeout,
  clearTimeout,
  Audio: class { play() {} }
};
domSandbox.window = domSandbox;
domSandbox.window.addEventListener = () => {};
domSandbox.window.removeEventListener = () => {};

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script block must be present');
vm.createContext(domSandbox);
vm.runInContext(scriptMatch[1], domSandbox);

const bridge = vm.runInContext(`
  ({
    getGameState: () => gameState,
    setGameState: (s) => { gameState = s; },
    handleSlotAssignment,
    placeCardInSlot,
    deductLife,
    setPageCompleteCallback: (fn) => { handlePageComplete = fn; }
  })
`, domSandbox);

assert(typeof bridge.handleSlotAssignment === 'function', 'handleSlotAssignment must be a function in sandbox');

// Setup mock gameState
bridge.setGameState({
  currentPage: 1,
  score: 0,
  lives: 3,
  cards: [
    { id: 'c1', question: 'ऋषभदेव जी', godname: 'ऋषभदेव जी', answer: 'बैल', correctAnswer: 'बैल', correctSign: 'बैल', color: '#ffecb3' },
    { id: 'c2', question: 'अजितनाथ जी', godname: 'अजितनाथ जी', answer: 'हाथी', correctAnswer: 'हाथी', correctSign: 'हाथी', color: '#ffe082' }
  ],
  slots: [
    { answer: 'बैल', sign: 'बैल', placedCardId: null, evalStatus: null },
    { answer: 'हाथी', sign: 'हाथी', placedCardId: null, evalStatus: null }
  ],
  poolCardIds: ['c1', 'c2'],
  submitted: false
});

// Test Wrong Assignment: place 'c2' (हाथी) into slot 0 ('बैल')
(async () => {
  const wrongRes = bridge.handleSlotAssignment('c2', 0);
  assert.strictEqual(wrongRes.status, 'wrong', 'Wrong placement must return status wrong');
  const sAfterWrong = bridge.getGameState();
  assert.strictEqual(sAfterWrong.lives, 2, 'Lives must decrease on wrong placement');
  assert.strictEqual(sAfterWrong.score, 0, 'Score must not increment on wrong placement');

  // While evaluating / shaking, placement should be blocked
  const blockedAttempt = bridge.handleSlotAssignment('c1', 0);
  assert.strictEqual(blockedAttempt, null, 'Actions during shake window must be blocked');

  // Wait 450ms for bounce back
  await new Promise(r => setTimeout(r, 450));

  // Verify slot 0 is cleared after bounce back and card restored to pool
  assert.strictEqual(sAfterWrong.slots[0].placedCardId, null, 'Slot placedCardId must be cleared after bounce back');
  assert.strictEqual(sAfterWrong.slots[0].evalStatus, null, 'Slot evalStatus must be cleared after bounce back');
  assert(sAfterWrong.poolCardIds.includes('c2'), 'Card c2 must be restored to pool');

  // Test Correct Assignment: place 'c1' (बैल) into slot 0 ('बैल')
  let pageCompleteCalled = false;
  bridge.setPageCompleteCallback(() => { pageCompleteCalled = true; });

  const correctRes1 = bridge.handleSlotAssignment('c1', 0);
  assert.strictEqual(correctRes1.status, 'correct', 'Correct placement must return status correct');
  const sAfterCorrect1 = bridge.getGameState();
  assert.strictEqual(sAfterCorrect1.score, 1, 'Score must increment on correct placement');
  assert.strictEqual(sAfterCorrect1.slots[0].placedCardId, 'c1', 'Slot 0 must hold card c1');
  assert.strictEqual(sAfterCorrect1.slots[0].evalStatus, 'correct', 'Slot 0 must have evalStatus correct');
  assert(!sAfterCorrect1.poolCardIds.includes('c1'), 'Card c1 must be removed from pool');
  assert.strictEqual(pageCompleteCalled, false, 'Page complete should not be called until all slots solved');

  // Test Attempting to overwrite a locked correct slot
  const overwriteAttempt = bridge.handleSlotAssignment('c2', 0);
  assert.strictEqual(overwriteAttempt, null, 'Cannot place card into locked correct slot');

  // Solve remaining slot
  const correctRes2 = bridge.handleSlotAssignment('c2', 1);
  assert.strictEqual(correctRes2.status, 'correct');
  assert.strictEqual(pageCompleteCalled, true, 'Page complete must be triggered when all slots solved');

  console.log('✅ Task 4: Instant validation logic tests passed.');
})();
