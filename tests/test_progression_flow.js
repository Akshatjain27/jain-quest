const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Static element and function assertions
assert(html.includes('loadPage'), 'loadPage function must exist');
assert(html.includes('triggerGameOver'), 'triggerGameOver function must exist');
assert(html.includes('triggerVictory'), 'triggerVictory function must exist');
assert(html.includes('returnToStartScreen'), 'returnToStartScreen function must exist');
assert(html.includes('id="gameover-modal"'), 'Must have gameover-modal');
assert(html.includes('id="victory-modal"'), 'Must have victory-modal');
assert(html.includes('id="page-complete-banner"'), 'Must have page-complete-banner');

// 2. Behavioral VM simulation tests
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
  getContext() {
    return {
      clearRect: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {}
    };
  }
}

const domElements = {
  'landing-screen': new MockElement('landing-screen'),
  'game-playfield': new MockElement('game-playfield'),
  'countdown-timer': new MockElement('countdown-timer'),
  'lifelines-container': new MockElement('lifelines-container'),
  'page-indicator': new MockElement('page-indicator'),
  'score-display': new MockElement('score-display'),
  'left-pool-grid': new MockElement('left-pool-grid'),
  'right-targets-grid': new MockElement('right-targets-grid'),
  'mobile-dock-cards': new MockElement('mobile-dock-cards'),
  'unplaced-badge': new MockElement('unplaced-badge'),
  'gameover-modal': new MockElement('gameover-modal'),
  'gameover-reason': new MockElement('gameover-reason'),
  'gameover-score': new MockElement('gameover-score'),
  'victory-modal': new MockElement('victory-modal'),
  'victory-score': new MockElement('victory-score'),
  'page-complete-banner': new MockElement('page-complete-banner'),
  'fx-canvas': new MockElement('fx-canvas')
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
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
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
    loadPage,
    handlePageComplete,
    triggerGameOver,
    triggerVictory,
    returnToStartScreen,
    getTimerRemaining: () => timerRemaining,
    getTimerInterval: () => timerInterval,
    getPageTransitionTimeout: () => pageTransitionTimeout
  })
`, domSandbox);

// Verify loadPage exists and works
assert(typeof bridge.loadPage === 'function', 'loadPage must be a function in sandbox');
assert(typeof bridge.triggerGameOver === 'function', 'triggerGameOver must be a function in sandbox');
assert(typeof bridge.triggerVictory === 'function', 'triggerVictory must be a function in sandbox');
assert(typeof bridge.returnToStartScreen === 'function', 'returnToStartScreen must be a function in sandbox');

// Test activeSet setup and loadPage(1)
const testSet = {
  id: 'test_set',
  name: 'Test Set',
  page1: Array.from({ length: 10 }, (_, i) => ({ godname: `God P1_${i}`, sign: `Sign P1_${i}` })),
  page2: Array.from({ length: 10 }, (_, i) => ({ godname: `God P2_${i}`, sign: `Sign P2_${i}` }))
};

bridge.setGameState({
  screen: 'playing',
  cards: [],
  poolCardIds: [],
  slots: [],
  submitted: false,
  score: 0,
  lives: 3,
  activeSet: testSet,
  currentPage: 1
});

bridge.loadPage(1);
let state = bridge.getGameState();
assert.strictEqual(state.currentPage, 1, 'Current page must be 1');
assert.strictEqual(state.cards.length, 10, 'Page 1 must have 10 cards');
assert.strictEqual(state.slots.length, 10, 'Page 1 must have 10 slots');
assert.strictEqual(domElements['page-indicator'].textContent, 'Page 1 of 2', 'Page indicator must show Page 1 of 2');
assert.strictEqual(bridge.getTimerRemaining(), 30, 'Page 1 timer must be initialized to 30s');

// Transition to Page 2
state.score = 10;
state.lives = 2; // Lifeline carried over
bridge.loadPage(2);
state = bridge.getGameState();
assert.strictEqual(state.currentPage, 2, 'Current page must be 2');
assert.strictEqual(state.lives, 2, 'Lifelines must carry over to Page 2');
assert.strictEqual(state.score, 10, 'Score must carry over to Page 2');
assert.strictEqual(state.cards.length, 10, 'Page 2 must have 10 cards');
assert.strictEqual(state.cards[0].godname.startsWith('God P2'), true, 'Page 2 cards must be loaded from activeSet.page2');
assert.strictEqual(domElements['page-indicator'].textContent, 'Page 2 of 2', 'Page indicator must show Page 2 of 2');
assert.strictEqual(bridge.getTimerRemaining(), 30, 'Page 2 timer must reset to 30s');

// Test triggerGameOver
bridge.triggerGameOver('lives');
assert.strictEqual(domElements['gameover-modal'].style.display, 'flex', 'GameOver modal must be displayed');
assert(domElements['gameover-reason'].textContent.includes('3 गलत उत्तर') || domElements['gameover-reason'].textContent.includes('Lifeline'), 'Reason text should indicate lifelines used');

bridge.triggerGameOver('timeout');
assert(domElements['gameover-reason'].textContent.includes('समय समाप्त') || domElements['gameover-reason'].textContent.includes("Time's Up"), 'Reason text should indicate timeout');

// Test triggerVictory
bridge.triggerVictory();
assert.strictEqual(domElements['victory-modal'].style.display, 'flex', 'Victory modal must be displayed');

// Test page completion transition and timeout clearance
bridge.setGameState({
  screen: 'playing',
  cards: [],
  poolCardIds: [],
  slots: [],
  submitted: false,
  score: 10,
  lives: 3,
  activeSet: testSet,
  currentPage: 1
});
bridge.handlePageComplete();
assert.notStrictEqual(bridge.getPageTransitionTimeout(), null, 'pageTransitionTimeout must be active during page transition');
assert.strictEqual(domElements['page-complete-banner'].style.display, 'flex', 'Page complete banner must be displayed');

// Test returnToStartScreen clears timeout
bridge.returnToStartScreen();
assert.strictEqual(domElements['game-playfield'].style.display, 'none', 'Playfield must be hidden');
assert.strictEqual(domElements['landing-screen'].style.display, 'flex', 'Landing screen must be shown');
assert.strictEqual(domElements['gameover-modal'].style.display, 'none', 'GameOver modal must be hidden');
assert.strictEqual(domElements['victory-modal'].style.display, 'none', 'Victory modal must be hidden');
assert.strictEqual(domElements['page-complete-banner'].style.display, 'none', 'Page complete banner must be hidden');
assert.strictEqual(bridge.getGameState().screen, 'landing', 'GameState screen must be landing');
assert.strictEqual(bridge.getTimerInterval(), null, 'Countdown timer interval must be null on start screen');
assert.strictEqual(bridge.getPageTransitionTimeout(), null, 'pageTransitionTimeout must be cleared on returnToStartScreen');

console.log('✅ Task 5: Progression flow and game over/victory tests passed.');
