const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Static Checks: Timer initial value and default reset
assert(html.includes('timerRemaining = 45'), 'Timer must start at 45 seconds');
assert(html.includes('resetCountdownTimer(seconds = 45') || html.includes('resetCountdownTimer(45)'), 'Timer reset must default to or use 30 seconds');

// 2. Large typography for timer
assert(
  (html.includes('text-3xl') || html.includes('text-4xl')) && html.includes('text-amber-300'),
  'Timer must use large font (text-3xl sm:text-4xl font-extrabold font-mono text-amber-300)'
);

// 3. Lives state in code
assert(html.includes('gameState.lives = 3') || html.includes('lives: 3'), 'Must start with 3 lives');

// 4. No Lifeline / लाइफलाइन wording anywhere in the file
assert(!html.includes('Lifeline'), 'Wording must not contain "Lifeline"');
assert(!html.includes('लाइफलाइन'), 'Wording must not contain "लाइफलाइन"');

// 5. Life wording checks
assert(html.includes('3 लाइफ (3 Life)'), 'Landing rules must mention 3 Life');
assert(html.includes('All 3 Lives Lost'), 'Game Over modal must mention All 3 Lives Lost');

// 6. 30s per page in landing rules and page complete banner
assert(html.includes('45 सेकंड प्रति पेज (45s Timer per Page)'), 'Rules must state 45s per page');
assert(!html.includes('60s Timer per Page') && !html.includes('1 मिनट प्रति पेज'), 'Old 60s / 1 min timer rules must be removed');
assert(!html.includes('60s टाइमर'), 'Page complete banner must not mention 60s');

// 7. Dynamic Execution Simulation via VM
class MockElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
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
  'timer-display': new MockElement('timer-display'),
  'lifelines-container': new MockElement('lifelines-container'),
  'page-indicator': new MockElement('page-indicator'),
  'score-display': new MockElement('score-display'),
  'start-game-btn': new MockElement('start-game-btn'),
  'gameover-modal': new MockElement('gameover-modal'),
  'gameover-reason': new MockElement('gameover-reason'),
  'gameover-score': new MockElement('gameover-score'),
  'pause-btn': new MockElement('pause-btn'),
  'unplaced-badge': new MockElement('unplaced-badge'),
  'left-pool-grid': new MockElement('left-pool-grid'),
  'right-targets-grid': new MockElement('right-targets-grid')
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
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id)
};
domSandbox.window = domSandbox;

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script block must be present');

vm.createContext(domSandbox);
vm.runInContext(scriptMatch[1], domSandbox);

const bridge = vm.runInContext(`
  ({
    getGameState: () => gameState,
    setGameState: (s) => { gameState = s; },
    getTimerRemaining: () => timerRemaining,
    setTimerRemaining: (val) => { timerRemaining = val; },
    deductLife,
    updateLivesUI,
    resetCountdownTimer,
    stopCountdownTimer,
    triggerGameOver,
    updateTimerDisplay
  })
`, domSandbox);

// Test initial timer & lives
assert.strictEqual(bridge.getGameState().lives, 3, 'Initial lives must be 3');
assert.strictEqual(bridge.getTimerRemaining(), 45, 'Initial timerRemaining must be 45');

// Test timer formatting & warning states
bridge.resetCountdownTimer(45);
assert.strictEqual(elements['countdown-timer'].textContent, '45', 'Timer display must show 45 as single integer');
assert(elements['countdown-timer'].classList.contains('text-amber-300'), 'Timer at >10s must have text-amber-300');
assert(!elements['countdown-timer'].classList.contains('text-red-500'), 'Timer at >10s must not have text-red-500');

// Test warning state at <= 10s
bridge.setTimerRemaining(10);
bridge.updateTimerDisplay();
assert.strictEqual(elements['countdown-timer'].textContent, '10', 'Timer display must show 10');
assert(elements['countdown-timer'].classList.contains('text-red-500'), 'Timer at <=10s must have text-red-500');
assert(elements['countdown-timer'].classList.contains('animate-pulse'), 'Timer at <=10s must pulse');

// Test warning state back to normal
bridge.setTimerRemaining(25);
bridge.updateTimerDisplay();
assert(!elements['countdown-timer'].classList.contains('text-red-500'), 'Timer returning to >10s must remove text-red-500');
assert(!elements['countdown-timer'].classList.contains('animate-pulse'), 'Timer returning to >10s must remove pulse');

// Test 3 Lives deductions & Game Over
bridge.deductLife();
assert.strictEqual(bridge.getGameState().lives, 2, 'Lives should be 2 after 1 wrong match');
assert(elements['lifelines-container'].innerHTML.includes('❤️'), 'Container must show remaining hearts');
assert(elements['lifelines-container'].innerHTML.includes('🖤'), 'Container must show lost heart');

bridge.deductLife();
assert.strictEqual(bridge.getGameState().lives, 1, 'Lives should be 1 after 2 wrong matches');

bridge.deductLife();
assert.strictEqual(bridge.getGameState().lives, 0, 'Lives should be 0 after 3 wrong matches');
assert.strictEqual(elements['gameover-reason'].textContent, '3 गलत उत्तर (All 3 Lives Lost)', 'Game over reason must state All 3 Lives Lost');

// Test Timeout Game Over
bridge.triggerGameOver('timeout');
assert.strictEqual(elements['gameover-reason'].textContent, "समय समाप्त (Time's Up)", 'Timeout reason must state Time\'s Up');

bridge.stopCountdownTimer();

console.log('✅ Task 2: 30s timer and 3 lives tests passed.');
