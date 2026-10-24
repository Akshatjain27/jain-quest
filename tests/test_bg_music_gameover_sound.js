const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Static Function Definitions
assert(html.includes('startBackgroundMusic'), 'Must have startBackgroundMusic function');
assert(html.includes('stopBackgroundMusic'), 'Must have stopBackgroundMusic function');
assert(html.includes('playGameOverSound'), 'Must have playGameOverSound function');

// 2. Integration / Hook Checks
assert(html.includes('playGameOverSound()'), 'triggerGameOver must invoke playGameOverSound()');
assert(/function\s+triggerGameOver[\s\S]*?stopBackgroundMusic\(\)/.test(html), 'triggerGameOver must call stopBackgroundMusic()');
assert(/function\s+triggerVictory[\s\S]*?stopBackgroundMusic\(\)/.test(html), 'triggerVictory must call stopBackgroundMusic()');
assert(/function\s+returnToStartScreen[\s\S]*?stopBackgroundMusic\(\)/.test(html), 'returnToStartScreen must call stopBackgroundMusic()');
assert(/function\s+launchGame[\s\S]*?startBackgroundMusic\(\)/.test(html), 'launchGame must call startBackgroundMusic()');
assert(/function\s+toggleSound[\s\S]*?stopBackgroundMusic\(\)/.test(html), 'toggleSound must call stopBackgroundMusic when muted');
assert(/function\s+toggleSound[\s\S]*?startBackgroundMusic\(\)/.test(html), 'toggleSound must call startBackgroundMusic when unmuted');

// 3. Audio characteristics in HTML
assert(html.includes('createBiquadFilter') || html.includes('biquad'), 'Background music or synth should use audio filter or oscillator nodes for pleasant sound');

// 4. Dynamic Execution in VM with Mock AudioContext
let audioNodesCreated = [];
class MockAudioNode {
  constructor(nodeType = 'generic') {
    this.nodeType = nodeType;
    this.gain = {
      value: 1,
      setValueAtTime: (val, time) => { this.gain.value = val; },
      linearRampToValueAtTime: (val, time) => { this.gain.value = val; },
      exponentialRampToValueAtTime: (val, time) => { this.gain.value = val; }
    };
    this.frequency = {
      value: 440,
      setValueAtTime: (val, time) => { this.frequency.value = val; },
      exponentialRampToValueAtTime: (val, time) => { this.frequency.value = val; }
    };
    this.type = 'sine';
    audioNodesCreated.push(this);
  }
  connect(dest) { return dest; }
  disconnect() {}
  start(time) {}
  stop(time) {}
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = new MockAudioNode('destination');
  }
  createOscillator() { return new MockAudioNode('oscillator'); }
  createGain() { return new MockAudioNode('gain'); }
  createBiquadFilter() { return new MockAudioNode('filter'); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

class MockElement {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
    this.disabled = false;
    this.classList = {
      _classes: new Set(),
      add(...c) { c.forEach(cls => this._classes.add(cls)); },
      remove(...c) { c.forEach(cls => this._classes.delete(cls)); },
      toggle(cls, force) {
        if (force === undefined) {
          if (this._classes.has(cls)) this._classes.delete(cls);
          else this._classes.add(cls);
        } else if (force) {
          this._classes.add(cls);
        } else {
          this._classes.delete(cls);
        }
      },
      contains(cls) { return this._classes.has(cls); }
    };
  }
}

const elements = {
  'gameover-modal': new MockElement('gameover-modal'),
  'gameover-reason': new MockElement('gameover-reason'),
  'gameover-score': new MockElement('gameover-score'),
  'victory-modal': new MockElement('victory-modal'),
  'victory-score': new MockElement('victory-score'),
  'sound-on-icon': new MockElement('sound-on-icon'),
  'sound-off-icon': new MockElement('sound-off-icon'),
  'landing-sound-on-icon': new MockElement('landing-sound-on-icon'),
  'landing-sound-off-icon': new MockElement('landing-sound-off-icon'),
  'landing-screen': new MockElement('landing-screen'),
  'game-playfield': new MockElement('game-playfield'),
  'start-game-btn': new MockElement('start-game-btn'),
  'landing-game-logo-container': new MockElement('landing-game-logo-container'),
  'pause-btn': new MockElement('pause-btn'),
  'countdown-timer': new MockElement('countdown-timer'),
  'timer-display': new MockElement('timer-display'),
  'lifelines-container': new MockElement('lifelines-container'),
  'page-indicator': new MockElement('page-indicator'),
  'score-display': new MockElement('score-display'),
  'fx-canvas': { getContext: () => null, width: 800, height: 600 }
};

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script block must be present');

const domSandbox = {
  console: console,
  document: {
    getElementById: (id) => elements[id] || new MockElement(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    fullscreenElement: null,
    documentElement: { requestFullscreen: () => Promise.resolve() }
  },
  window: {
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 1024,
    innerHeight: 768
  },
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  addEventListener: () => {},
  removeEventListener: () => {},
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {}
};
domSandbox.window = domSandbox;

vm.createContext(domSandbox);
vm.runInContext(scriptMatch[1], domSandbox);

const bridge = vm.runInContext(`
  ({
    getGameState: () => gameState,
    setGameState: (s) => { gameState = s; },
    getSoundEnabled: () => soundEnabled,
    setSoundEnabled: (val) => { soundEnabled = val; },
    getBgMusicInterval: () => bgMusicInterval,
    startBackgroundMusic,
    stopBackgroundMusic,
    playGameOverSound,
    toggleSound,
    togglePause,
    triggerGameOver,
    triggerVictory,
    returnToStartScreen
  })
`, domSandbox);

// Test startBackgroundMusic when soundEnabled = true and screen = 'playing'
bridge.setSoundEnabled(true);
bridge.getGameState().screen = 'playing';
bridge.startBackgroundMusic();
assert(bridge.getBgMusicInterval() !== null, 'bgMusicInterval must be set when background music starts');

// Test idempotent startBackgroundMusic
const currentInterval = bridge.getBgMusicInterval();
bridge.startBackgroundMusic();
assert.strictEqual(bridge.getBgMusicInterval(), currentInterval, 'Calling startBackgroundMusic again must be idempotent');

// Test stopBackgroundMusic
bridge.stopBackgroundMusic();
assert.strictEqual(bridge.getBgMusicInterval(), null, 'bgMusicInterval must be cleared on stopBackgroundMusic');

// Test playGameOverSound
audioNodesCreated = [];
bridge.playGameOverSound();
assert(audioNodesCreated.length > 0, 'playGameOverSound must instantiate audio nodes');

// Test toggleSound
bridge.setSoundEnabled(true);
bridge.getGameState().screen = 'playing';
bridge.startBackgroundMusic();
assert(bridge.getBgMusicInterval() !== null, 'bgMusic should be running before mute');

bridge.toggleSound(); // Mute
assert.strictEqual(bridge.getSoundEnabled(), false, 'Sound should be disabled after toggleSound');
assert.strictEqual(bridge.getBgMusicInterval(), null, 'bgMusicInterval should be cleared when muted');

bridge.toggleSound(); // Unmute
assert.strictEqual(bridge.getSoundEnabled(), true, 'Sound should be enabled after second toggleSound');
assert(bridge.getBgMusicInterval() !== null, 'bgMusicInterval should be restarted when unmuted during gameplay');

// Test triggerGameOver
bridge.triggerGameOver('lives');
assert.strictEqual(bridge.getBgMusicInterval(), null, 'bgMusicInterval must be cleared on Game Over');
assert.strictEqual(elements['gameover-modal'].style.display, 'flex');

// Test triggerVictory
bridge.startBackgroundMusic();
assert(bridge.getBgMusicInterval() !== null, 'bgMusic running');
bridge.triggerVictory();
assert.strictEqual(bridge.getBgMusicInterval(), null, 'bgMusicInterval must be cleared on Victory');
assert.strictEqual(elements['victory-modal'].style.display, 'flex');

// Test returnToStartScreen
bridge.startBackgroundMusic();
bridge.returnToStartScreen();
assert.strictEqual(bridge.getBgMusicInterval(), null, 'bgMusicInterval must be cleared on returnToStartScreen');
assert.strictEqual(elements['gameover-modal'].style.display, 'none');

bridge.stopBackgroundMusic();
console.log('✅ Task 3: Background music and game over sound tests passed.');
