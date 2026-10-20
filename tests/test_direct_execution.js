const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// ============================================================================
// LIGHTWEIGHT DOM MOCK FOR NODE VM
// ============================================================================
class MockElement {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = '';
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.disabled = false;
    this.style = {};
    this.dataset = {};
    this.options = [];
    this.children = [];
    this.selectedIndex = 0;
    this.parentElement = null;
    this.classList = {
      _classes: new Set(),
      add(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains(c) { return this._classes.has(c); }
    };
  }

  appendChild(child) {
    if (!child) return child;
    child.parentElement = this;
    this.children.push(child);
    if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
      this.options.push(child);
    }
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    if (this.tagName === 'SELECT') {
      const oIdx = this.options.indexOf(child);
      if (oIdx !== -1) this.options.splice(oIdx, 1);
    }
    return child;
  }

  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  querySelector(sel) {
    return new MockElement('div');
  }

  querySelectorAll(sel) {
    return [];
  }

  addEventListener() {}
  removeEventListener() {}
  getContext(type) {
    return {
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {}
    };
  }
}

const elementsRegistry = new Map();
function getOrCreateElement(id, tag = 'div') {
  if (!elementsRegistry.has(id)) {
    elementsRegistry.set(id, new MockElement(tag, id));
  }
  return elementsRegistry.get(id);
}

// Pre-create select element
const datasetSelect = getOrCreateElement('dataset-select', 'select');
// Populate initial static options as found in HTML
[
  { value: 'random', text: '🎲 Random Set' },
  { value: 'video_set1', text: 'Video Set 1 (10 भगवान)' },
  { value: 'video_set2', text: 'Video Set 2 (10 भगवान)' },
  { value: 'authentic_10', text: 'Authentic Signs (10 भगवान)' },
  { value: 'json10_exact', text: 'Attached jain-quest.json (Exact)' }
].forEach(item => {
  const opt = new MockElement('option');
  opt.value = item.value;
  opt.textContent = item.text;
  datasetSelect.appendChild(opt);
});

const mockWindow = {
  addEventListener() {},
  removeEventListener() {},
  AudioContext: class {
    createOscillator() {
      return {
        type: '',
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start() {},
        stop() {}
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      };
    }
    get destination() { return {}; }
    get currentTime() { return 0; }
    get state() { return 'running'; }
    resume() {}
  },
  webkitAudioContext: class {},
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  fetch: () => Promise.resolve({ ok: false }),
  localStorage: { getItem() { return null; }, setItem() {} }
};

const mockDocument = {
  getElementById(id) {
    return getOrCreateElement(id);
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  querySelector(sel) {
    return new MockElement('div');
  },
  querySelectorAll(sel) {
    return [];
  },
  body: new MockElement('body'),
  addEventListener() {},
  removeEventListener() {}
};

const sandbox = {
  window: mockWindow,
  document: mockDocument,
  console: { log() {}, warn() {}, error() {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Promise: Promise,
  Math: Math,
  Array: Array,
  Object: Object,
  Date: Date,
  Set: Set,
  Map: Map,
  JSON: JSON
};

// ============================================================================
// EXTRACT & EXECUTE SCRIPT DIRECTLY FROM HTML
// ============================================================================
const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script block must be present in jain_quest_matching_game.html');

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const exportsBridge = vm.runInContext(`
  ({
    DATASET_REGISTRY,
    VIDEO_PAGE1_DATASET,
    VIDEO_PAGE2_DATASET,
    AUTHENTIC_SET_DATASET,
    ATTACHED_JSON_EXACT,
    getGameState: () => gameState,
    setGameState: (s) => { gameState = s; },
    getIsEvaluating: () => isEvaluating,
    setIsEvaluating: (v) => { isEvaluating = v; },
    getActiveDatasetId: () => activeDatasetId,
    setActiveDatasetId: (id) => { activeDatasetId = id; },
    initGameBoard,
    startRandomGame,
    updateDatasetSelectDropdown,
    pickRandomDataset,
    switchDatasetMode,
    selectDatasetById,
    renderBoard,
    showResultModal
  })
`, sandbox);

const {
  DATASET_REGISTRY,
  VIDEO_PAGE1_DATASET,
  getGameState,
  setGameState,
  getIsEvaluating,
  setIsEvaluating,
  getActiveDatasetId,
  setActiveDatasetId,
  initGameBoard,
  startRandomGame,
  updateDatasetSelectDropdown,
  pickRandomDataset,
  switchDatasetMode,
  selectDatasetById,
  renderBoard,
  showResultModal
} = exportsBridge;

// ============================================================================
// TEST 1: DATASET_REGISTRY CONTAINS REQUIRED SETS WITH MATCHING IDS
// ============================================================================
assert(Array.isArray(DATASET_REGISTRY), 'DATASET_REGISTRY must be an array');
assert(DATASET_REGISTRY.length >= 4, 'DATASET_REGISTRY must have at least 4 registered sets');

const requiredIds = ['video_set1', 'video_set2', 'authentic_10', 'json10_exact'];
requiredIds.forEach(reqId => {
  const match = DATASET_REGISTRY.find(d => d.id === reqId);
  assert(match, `DATASET_REGISTRY must contain canonical dataset with ID: ${reqId}`);
  assert(match.name && typeof match.name === 'string', `${reqId} must have valid name`);
  assert(Array.isArray(match.items) && match.items.length === 10, `${reqId} must contain 10 items`);
  match.items.forEach((item, i) => {
    assert(item.godname && typeof item.godname === 'string', `${reqId} item ${i} must have godname`);
    assert(item.sign && typeof item.sign === 'string', `${reqId} item ${i} must have sign`);
  });
});
console.log('✅ Direct Execution Test 1: DATASET_REGISTRY verified with canonical IDs and 10 items each.');

// ============================================================================
// TEST 2: initGameBoard() PRODUCES SHUFFLED poolCardIds
// ============================================================================
initGameBoard(VIDEO_PAGE1_DATASET);
let state = getGameState();
assert(state && Array.isArray(state.poolCardIds), 'gameState must contain poolCardIds array');
assert.strictEqual(state.poolCardIds.length, 10, 'poolCardIds must have 10 cards initially');

// Verify cards are shuffled: over 20 runs, poolCardIds cannot be identical to unshuffled order every time
let sawShuffledOrder = false;
const sequentialIds = state.cards.map(c => c.id);

for (let trial = 0; trial < 25; trial++) {
  initGameBoard(VIDEO_PAGE1_DATASET);
  const currentPool = getGameState().poolCardIds;
  const isIdentical = currentPool.every((id, idx) => id === sequentialIds[idx]);
  if (!isIdentical) {
    sawShuffledOrder = true;
    break;
  }
}
assert.strictEqual(sawShuffledOrder, true, 'poolCardIds must be shuffled and not stay in strictly sequential order');
console.log('✅ Direct Execution Test 2: initGameBoard() produces shuffled poolCardIds.');

// ============================================================================
// TEST 3: updateDatasetSelectDropdown() DEDUPLICATES OPTIONS
// ============================================================================
// Intentionally inject duplicates into the mock select element
const testSelect = getOrCreateElement('dataset-select', 'select');
const dupOpt1 = new MockElement('option');
dupOpt1.value = 'video_set1';
dupOpt1.textContent = 'Duplicate Video Set 1';
testSelect.appendChild(dupOpt1);

const dupOpt2 = new MockElement('option');
dupOpt2.value = 'authentic_10';
dupOpt2.textContent = 'Duplicate Authentic Signs';
testSelect.appendChild(dupOpt2);

// Re-run dropdown update
updateDatasetSelectDropdown();

const optionValues = testSelect.options.map(o => o.value);
const uniqueValues = new Set(optionValues);
assert.strictEqual(optionValues.length, uniqueValues.size, `Dropdown must not contain duplicate options: [${optionValues.join(', ')}]`);

requiredIds.forEach(reqId => {
  assert(uniqueValues.has(reqId), `Dropdown must retain required option ID: ${reqId}`);
});
console.log('✅ Direct Execution Test 3: updateDatasetSelectDropdown() deduplicates options cleanly.');

// ============================================================================
// TEST 4: ASYNC RACE GUARDS AND isEvaluating
// ============================================================================
// When isEvaluating === true:
setIsEvaluating(true);
initGameBoard(VIDEO_PAGE1_DATASET);
const boardBefore = JSON.stringify(getGameState().poolCardIds);

// 4a. startRandomGame() must return early
startRandomGame();
const boardAfterRandom = JSON.stringify(getGameState().poolCardIds);
assert.strictEqual(boardBefore, boardAfterRandom, 'startRandomGame() must not execute while isEvaluating is true');

// 4b. switchDatasetMode() must return early
const datasetBefore = getActiveDatasetId();
switchDatasetMode('video_set2');
assert.strictEqual(getActiveDatasetId(), datasetBefore, 'switchDatasetMode() must not execute while isEvaluating is true');

// 4c. selectDatasetById() must return early
selectDatasetById('authentic_10');
assert.strictEqual(getActiveDatasetId(), datasetBefore, 'selectDatasetById() must not execute while isEvaluating is true');

// 4d. renderBoard() must disable new-game-btn and dataset-select
const newGameBtn = getOrCreateElement('new-game-btn', 'button');
renderBoard();
assert.strictEqual(newGameBtn.disabled, true, 'new-game-btn must be disabled during evaluation');
assert.strictEqual(testSelect.disabled, true, 'dataset-select must be disabled during evaluation');

// Reset isEvaluating to false
setIsEvaluating(false);
renderBoard();
assert.strictEqual(newGameBtn.disabled, false, 'new-game-btn must be re-enabled after evaluation');
assert.strictEqual(testSelect.disabled, false, 'dataset-select must be re-enabled after evaluation');
console.log('✅ Direct Execution Test 4: Async evaluation race guards and button states verified.');

// ============================================================================
// TEST 5: MINOR POLISH (Consecutive Pick Prevention & Dynamic Subtitle)
// ============================================================================
// 5a. Consecutive Pick Prevention
setActiveDatasetId('video_set1');
let consecutiveDuplicateFound = false;
for (let i = 0; i < 30; i++) {
  const picked = pickRandomDataset();
  if (picked.id === 'video_set1') {
    consecutiveDuplicateFound = true;
    break;
  }
}
assert.strictEqual(consecutiveDuplicateFound, false, 'pickRandomDataset() must avoid consecutively picking the active dataset when alternatives exist');

// 5b. Result Modal Dynamic Subtitle
const subtitleEl = getOrCreateElement('result-subtitle', 'p');
const timerDisplay = getOrCreateElement('timer-display', 'div');
timerDisplay.textContent = '1:23';

// Scenario A: Perfect score 10/10
setGameState({
  score: 10,
  cards: Array.from({ length: 10 }, (_, i) => ({ id: `c_${i}` })),
  slots: []
});
showResultModal();
assert(subtitleEl.textContent.includes('शानदार! आपने सभी 10 सही उत्तर दिए हैं'), 'Score 10 must show congratulatory subtitle');

// Scenario B: Partial score 7/10
setGameState({
  score: 7,
  cards: Array.from({ length: 10 }, (_, i) => ({ id: `c_${i}` })),
  slots: []
});
showResultModal();
assert(subtitleEl.textContent.includes('Show Correct Answers'), 'Score < 10 must show prompt to inspect correct answers');

console.log('✅ Direct Execution Test 5: Consecutive dataset prevention and dynamic result subtitle verified.');

console.log('\n🎉 ALL DIRECT EXECUTION TESTS PASSED SUCCESSFULLY!');
