const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Static HTML assertions
assert(html.includes('id="exit-game-btn"'), 'Header must have exit button');
assert(html.includes('returnToStartScreen()'), 'Exit button must return to home');
assert(!html.includes('id="helper-banner"'), 'Helper banner must be removed from playfield');
assert(html.includes('>Home</button>') || html.includes('होम (Home)</button>') || html.includes('Home (होम)</button>'), 'Modal button must be labeled Home');

// 2. Audio polish static assertions
assert(html.includes('gainToDisconnect'), 'stopBackgroundMusic must use gainToDisconnect snapshot');
assert(/function\s+returnToStartScreen[\s\S]*?bgMusicStep\s*=\s*0/.test(html), 'returnToStartScreen must reset bgMusicStep = 0');
assert(/function\s+launchGame[\s\S]*?bgMusicStep\s*=\s*0/.test(html), 'launchGame must reset bgMusicStep = 0');

// 3. Dynamic VM simulation of Exit button navigation & audio step reset
class MockElement {
  constructor(id = '') {
    this.id = id;
    this.style = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    };
  }
}

const elements = {
  'landing-screen': new MockElement('landing-screen'),
  'game-playfield': new MockElement('game-playfield'),
  'exit-game-btn': new MockElement('exit-game-btn'),
  'gameover-modal': new MockElement('gameover-modal'),
  'victory-modal': new MockElement('victory-modal'),
  'page-complete-banner': new MockElement('page-complete-banner'),
  'result-modal': new MockElement('result-modal'),
  'start-game-btn': new MockElement('start-game-btn'),
  'landing-game-logo-container': new MockElement('landing-game-logo-container'),
  'fx-canvas': { getContext: () => null }
};

class MockAudioNode {
  constructor() {
    this.gain = {
      value: 0.05,
      setValueAtTime: (v) => { this.gain.value = v; },
      linearRampToValueAtTime: (v) => { this.gain.value = v; }
    };
  }
  connect() {}
  disconnect() { this.disconnected = true; }
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = new MockAudioNode();
  }
  createGain() { return new MockAudioNode(); }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  resume() { return Promise.resolve(); }
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script block must exist');

const sandbox = {
  console,
  document: {
    getElementById: (id) => elements[id] || new MockElement(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  addEventListener: () => {},
  removeEventListener: () => {},
  setInterval,
  clearInterval,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const bridge = vm.runInContext(`
  ({
    getBgMusicStep: () => bgMusicStep,
    setBgMusicStep: (v) => { bgMusicStep = v; },
    getBgMusicGain: () => bgMusicGain,
    startBackgroundMusic,
    stopBackgroundMusic,
    returnToStartScreen,
    getGameState: () => gameState,
    setSoundEnabled: (v) => { soundEnabled = v; }
  })
`, sandbox);

bridge.setSoundEnabled(true);
bridge.getGameState().screen = 'playing';
bridge.setBgMusicStep(14);
assert.strictEqual(bridge.getBgMusicStep(), 14, 'bgMusicStep should be 14 before return');

// Simulate clicking exit button -> returnToStartScreen()
bridge.returnToStartScreen();
assert.strictEqual(bridge.getBgMusicStep(), 0, 'bgMusicStep must be reset to 0 upon returnToStartScreen()');
assert.strictEqual(elements['landing-screen'].style.display, 'flex', 'Landing screen must be displayed');
assert.strictEqual(elements['game-playfield'].style.display, 'none', 'Game playfield must be hidden');
assert.strictEqual(elements['gameover-modal'].style.display, 'none', 'Game over modal must be hidden');
assert.strictEqual(elements['victory-modal'].style.display, 'none', 'Victory modal must be hidden');

console.log('✅ Task 4: Exit button and Home navigation tests passed.');
