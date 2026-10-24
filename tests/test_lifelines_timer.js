const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Header elements presence
assert(html.includes('id="lifelines-container"'), 'Must have lifelines container');
assert(html.includes('id="countdown-timer"'), 'Must have countdown timer display');
assert(html.includes('id="page-indicator"'), 'Must have page indicator');
assert(html.includes('id="score-display"'), 'Must have score display');

// 2. Removed elements check
assert(!html.includes('id="dataset-select"'), 'dataset-select dropdown must be removed');
assert(!html.includes('id="submit-btn"'), 'submit-btn must be removed');

// Ensure openDataModal is not in the header
const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
assert(headerMatch, 'Header must exist');
assert(!headerMatch[0].includes('openDataModal'), 'openDataModal must be removed from header');
assert(!headerMatch[0].includes('id="new-game-btn"'), 'new-game-btn must be removed from header');

// 3. Logic functions existence
assert(html.includes('function startCountdownTimer'), 'Must define startCountdownTimer');
assert(html.includes('function stopCountdownTimer'), 'Must define stopCountdownTimer');
assert(html.includes('function resetCountdownTimer'), 'Must define resetCountdownTimer');
assert(html.includes('function updateLifelinesUI'), 'Must define updateLifelinesUI');
assert(html.includes('function deductLife'), 'Must define deductLife');

// 4. In-memory logic simulation via vm
class MockElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.classList = {
      _classes: new Set(),
      add(...c) { c.forEach(cls => this._classes.add(cls)); },
      remove(...c) { c.forEach(cls => this._classes.delete(cls)); },
      contains(cls) { return this._classes.has(cls); }
    };
  }
}

const elements = {
  'countdown-timer': new MockElement('countdown-timer'),
  'lifelines-container': new MockElement('lifelines-container'),
  'page-indicator': new MockElement('page-indicator'),
  'score-display': new MockElement('score-display'),
  'start-game-btn': new MockElement('start-game-btn')
};

const domSandbox = {
  console,
  document: {
    getElementById: (id) => elements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  window: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  setInterval,
  clearInterval,
  setTimeout,
  clearTimeout
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
    getTimerRemaining: () => timerRemaining,
    deductLife,
    updateLifelinesUI,
    resetCountdownTimer,
    stopCountdownTimer,
    setTriggerGameOver: (fn) => { triggerGameOver = fn; }
  })
`, domSandbox);

// Check initial gameState.lives
const gameState = bridge.getGameState();
assert(gameState, 'gameState must be defined');
assert.strictEqual(gameState.lives, 3, 'Initial lives must be 3');

// Test deductLife function
let gameOverReason = null;
bridge.setTriggerGameOver((reason) => {
  gameOverReason = reason;
});

bridge.deductLife();
assert.strictEqual(bridge.getGameState().lives, 2, 'Lives should decrement to 2');
assert(elements['lifelines-container'].innerHTML.includes('❤️') || elements['lifelines-container'].textContent.includes('❤️'), 'Lifelines container must update');

bridge.deductLife();
assert.strictEqual(bridge.getGameState().lives, 1, 'Lives should decrement to 1');

bridge.deductLife();
assert.strictEqual(bridge.getGameState().lives, 0, 'Lives should reach 0');
assert.strictEqual(gameOverReason, 'lives', 'triggerGameOver should be called with "lives" when lives reach 0');

// Test countdown timer logic
bridge.resetCountdownTimer(60);
assert.strictEqual(bridge.getTimerRemaining(), 60, 'Timer should reset to 60');
assert.strictEqual(elements['countdown-timer'].textContent, '1:00', 'Timer display should show 1:00');

bridge.stopCountdownTimer();

console.log('✅ Task 3: Lifelines & Countdown Timer DOM and logic tests passed.');
