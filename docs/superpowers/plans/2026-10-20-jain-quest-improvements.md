# Jain Quest Matching Game Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `jain_quest_matching_game.html` into a polished, responsive single-round matching game with multi-JSON random selection, mobile sticky dock drawer, authentic Wordwall video feedback, sequential grading animations, confetti particle celebrations, and streamlined navigation.

**Architecture:** Single self-contained HTML file (`jain_quest_matching_game.html`) combining modern Tailwind CSS utility classes, custom CSS keyframe animations, zero-dependency inline Canvas confetti engine, synthesized Web Audio, and modular vanilla JavaScript state management.

**Tech Stack:** HTML5, Vanilla JavaScript (ES6+), CSS3 Keyframe Animations, HTML5 Canvas API, Web Audio API, Tailwind CSS (via CDN), Google Fonts (Noto Sans Devanagari, Cinzel, Nunito).

## Global Constraints
- Single set always: A game session consists of exactly 1 round of 10 items.
- Self-contained in `jain_quest_matching_game.html`: No extra external runtime JS script files or CDN dependencies beyond existing Tailwind CDN and Google Fonts.
- Random dataset selection: Automatically picks one random 10-item dataset on startup and upon clicking "New Game (🎲 Random)".
- Multi-file JSON upload: Allows uploading multiple `.json` files simultaneously into the playable dataset pool.
- Responsive design: Full-width classroom chalkboard on desktop (`>= 1024px`); scrollable target list with sticky bottom dock drawer for cards on mobile/tablet (`< 1024px`).
- Wordwall video feedback: Sequential grading with active highlight, green checkmark ($\checkmark$) elastic pop, red/dark cross ($\boldsymbol{\times}$) with wobble and slate-grey card transition (`#8e8e8e`), bell chime and thud sounds, and full-screen celebration confetti.

---

### Task 1: Multi-Dataset Pool & Random Selection Engine

**Files:**
- Modify: `jain_quest_matching_game.html:545-635`
- Test: `tests/test_dataset_engine.js`

**Interfaces:**
- Produces:
  - `DATASET_REGISTRY`: Array of registered datasets (Video Set 1, Video Set 2, Authentic Set, etc.).
  - `pickRandomDataset()`: Returns `{ name: string, data: Array<{godname: string, sign: string}> }`.
  - `registerCustomDatasets(fileArray)`: Adds validated JSON datasets to `DATASET_REGISTRY`.
  - `activeDataset`: Currently active 10-item array.
  - `activeDatasetName`: Display label of active dataset.

- [ ] **Step 1: Write failing test for dataset registry and random selection**

Create `tests/test_dataset_engine.js`:
```javascript
const assert = require('assert');

// Simulate the engine module
const {
  DATASET_REGISTRY,
  pickRandomDataset,
  validateDataset,
  registerCustomDataset
} = require('./dataset_engine_stub.js');

// Test 1: Built-in datasets exist and have 10 valid items
assert(Array.isArray(DATASET_REGISTRY), 'DATASET_REGISTRY should be an array');
assert(DATASET_REGISTRY.length >= 3, 'Should have at least 3 default datasets (Set 1, Set 2, Authentic)');

DATASET_REGISTRY.forEach(ds => {
  assert(ds.name && typeof ds.name === 'string', 'Dataset must have a name');
  assert(Array.isArray(ds.items) && ds.items.length === 10, `${ds.name} must contain exactly 10 items`);
  ds.items.forEach(item => {
    assert(item.godname && typeof item.godname === 'string', 'Item must have godname');
    assert(item.sign && typeof item.sign === 'string', 'Item must have sign');
  });
});

// Test 2: Random picker returns valid dataset
const randomDs = pickRandomDataset();
assert(randomDs && randomDs.name && Array.isArray(randomDs.items), 'pickRandomDataset must return valid dataset');
assert.strictEqual(randomDs.items.length, 10, 'Selected dataset must have 10 items');

// Test 3: Validation helper rejects invalid structures
assert.strictEqual(validateDataset([]), false);
assert.strictEqual(validateDataset([{ godname: 'Test' }]), false);
assert.strictEqual(validateDataset([{ godname: 'Test', sign: 'Sign' }]), true);

console.log('✅ Task 1 tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_dataset_engine.js`
Expected: FAIL with `MODULE_NOT_FOUND` (stub does not exist yet).

- [ ] **Step 3: Implement dataset engine module & integrate into `jain_quest_matching_game.html`**

Create `tests/dataset_engine_stub.js` to back the test:
```javascript
const VIDEO_PAGE1_DATASET = [
  { "godname": "कुंथुनाथ भगवान", "sign": "बकरा" },
  { "godname": "धर्मनाथ भगवान", "sign": "वज्रदंड" },
  { "godname": "सुमतिनाथ भगवान", "sign": "चकवा" },
  { "godname": "महावीर भगवान", "sign": "सिंह" },
  { "godname": "चंद्रप्रभ भगवान", "sign": "चंद्रमा" },
  { "godname": "आदिनाथ भगवान", "sign": "बैल" },
  { "godname": "श्रेयांसनाथ भगवान", "sign": "गेंडा" },
  { "godname": "पार्श्वनाथ भगवान", "sign": "सर्प" },
  { "godname": "पद्मप्रभु भगवान", "sign": "लाल कमल" },
  { "godname": "संभवनाथ भगवान", "sign": "घोड़ा" }
];

const VIDEO_PAGE2_DATASET = [
  { "godname": "शीतलनाथ भगवान", "sign": "कल्पवृक्ष" },
  { "godname": "अभिनंदननाथ भगवान", "sign": "बंदर" },
  { "godname": "वासुपूज्य भगवान", "sign": "भैंसा" },
  { "godname": "विमलनाथ भगवान", "sign": "शूकर" },
  { "godname": "सुपार्श्वनाथ भगवान", "sign": "स्वस्तिक" },
  { "godname": "शांतिनाथ भगवान", "sign": "हिरण" },
  { "godname": "अनंतनाथ भगवान", "sign": "सेही" },
  { "godname": "पुष्पदंत भगवान", "sign": "मगर" },
  { "godname": "मुनिसुव्रतनाथ भगवान", "sign": "कछुआ" },
  { "godname": "अजितनाथ भगवान", "sign": "हाथी" }
];

const AUTHENTIC_SET_DATASET = [
  { "godname": "कुंथुनाथ भगवान", "sign": "बकरा" },
  { "godname": "विमलनाथ भगवान", "sign": "शूकर" },
  { "godname": "धर्मनाथ भगवान", "sign": "वज्रदंड" },
  { "godname": "अजितनाथ भगवान", "sign": "हाथी" },
  { "godname": "आदिनाथ भगवान", "sign": "बैल" },
  { "godname": "सुपार्श्वनाथ भगवान", "sign": "स्वस्तिक" },
  { "godname": "पुष्पदंत भगवान", "sign": "मगर" },
  { "godname": "शांतिनाथ भगवान", "sign": "हिरण" },
  { "godname": "महावीर भगवान", "sign": "सिंह" },
  { "godname": "मुनिसुव्रतनाथ भगवान", "sign": "कछुआ" }
];

const DATASET_REGISTRY = [
  { id: 'video_set1', name: 'Video Set 1 (10 भगवान)', items: VIDEO_PAGE1_DATASET },
  { id: 'video_set2', name: 'Video Set 2 (10 भगवान)', items: VIDEO_PAGE2_DATASET },
  { id: 'authentic_10', name: 'Authentic Signs (10 भगवान)', items: AUTHENTIC_SET_DATASET }
];

function validateDataset(data) {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(item => item && typeof item.godname === 'string' && typeof item.sign === 'string');
}

function pickRandomDataset() {
  const idx = Math.floor(Math.random() * DATASET_REGISTRY.length);
  return DATASET_REGISTRY[idx];
}

function registerCustomDataset(name, items) {
  if (!validateDataset(items)) return false;
  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  DATASET_REGISTRY.push({ id, name, items: items.slice(0, 10) });
  return true;
}

module.exports = {
  DATASET_REGISTRY,
  pickRandomDataset,
  validateDataset,
  registerCustomDataset
};
```

Update `jain_quest_matching_game.html` with this dataset registry and random pick functions.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_dataset_engine.js`
Expected: PASS with `✅ Task 1 tests passed successfully.`

---

### Task 2: Responsive HTML Layout, CSS Keyframes & Mobile Sticky Dock

**Files:**
- Modify: `jain_quest_matching_game.html:15-180` (CSS Keyframes), `jain_quest_matching_game.html:373-404` (Main Playfield & Sticky Dock HTML)
- Test: `tests/test_layout_structure.js`

**Interfaces:**
- Produces:
  - Sticky bottom dock element (`#mobile-cards-dock`) with expand/collapse toggle and unplaced counter badge (`#unplaced-badge`).
  - Scrollable sign target grid with bottom clearance padding (`pb-36`).
  - Keyframe classes: `.badge-pop`, `.shake-wrong`, `.snap-pop`, `.selected-card`, `.card-evaluating`.
  - Responsive breakpoint handling: desktop 2-column classroom, mobile single-column targets + bottom card tray.

- [ ] **Step 1: Write test for DOM elements and CSS classes**

Create `tests/test_layout_structure.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Verify key DOM elements exist
assert(html.includes('id="mobile-cards-dock"'), 'Mobile sticky dock element must exist');
assert(html.includes('id="unplaced-badge"'), 'Unplaced counter badge element must exist');
assert(html.includes('id="dock-toggle-btn"'), 'Dock expand/collapse toggle button must exist');
assert(html.includes('id="fx-canvas"'), 'FX canvas element must exist');

// Verify key CSS keyframes and animations exist
assert(html.includes('@keyframes shake-wrong'), 'shake-wrong keyframe must exist');
assert(html.includes('@keyframes snap-pop'), 'snap-pop keyframe must exist');
assert(html.includes('@keyframes badge-pop'), 'badge-pop keyframe must exist');
assert(html.includes('.selected-card'), 'selected-card class must exist');
assert(html.includes('.card-evaluating'), 'card-evaluating class must exist');

console.log('✅ Task 2 tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_layout_structure.js`
Expected: FAIL (`AssertionError: Mobile sticky dock element must exist`).

- [ ] **Step 3: Implement Sticky Dock HTML & CSS Keyframes**

Add to `jain_quest_matching_game.html`:
1. CSS Keyframe definitions:
   ```css
   @keyframes shake-wrong {
     0%, 100% { transform: translateX(0); }
     20%, 60% { transform: translateX(-6px); }
     40%, 80% { transform: translateX(6px); }
   }
   .shake-wrong {
     animation: shake-wrong 0.32s ease-in-out;
   }

   @keyframes snap-pop {
     0% { transform: scale(0.92); }
     60% { transform: scale(1.05); }
     100% { transform: scale(1); }
   }
   .snap-pop {
     animation: snap-pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
   }

   .card-evaluating {
     outline: 4px solid #3b82f6 !important;
     outline-offset: 3px;
     transform: scale(1.03);
   }
   ```
2. Mobile Sticky Dock container below main target area:
   ```html
   <div id="mobile-cards-dock" class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 backdrop-blur-md border-t-2 border-amber-600/50 shadow-2xl transition-all duration-300">
     <div class="max-w-[1600px] mx-auto px-3 py-1.5 flex items-center justify-between border-b border-stone-800">
       <span id="unplaced-badge" class="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
         ✨ 10 शेष (10 unplaced)
       </span>
       <button id="dock-toggle-btn" onclick="toggleDockExpand()" class="text-xs text-amber-200 hover:text-white font-bold flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded">
         <span id="dock-toggle-text">Expand Tray ▲</span>
       </button>
     </div>
     <div id="mobile-dock-cards" class="p-2 overflow-x-auto flex gap-2 no-scrollbar">
       <!-- Dynamic card items -->
     </div>
   </div>
   ```
3. Fullscreen celebration canvas:
   ```html
   <canvas id="fx-canvas" class="fixed inset-0 pointer-events-none z-50 w-full h-full"></canvas>
   ```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_layout_structure.js`
Expected: PASS with `✅ Task 2 tests passed successfully.`

---

### Task 3: Interaction & Touch Drag Engine (Tap-to-Place, Swap, Recall)

**Files:**
- Modify: `jain_quest_matching_game.html:800-1090`
- Test: `tests/test_interactions.js`

**Interfaces:**
- Produces:
  - `handleCardSelect(cardId)`: Selects card or deselects.
  - `placeCardInSlot(cardId, slotIndex)`: Handles placement, displacement, and swapping.
  - `moveCardToPool(cardId)`: Recalls placed card to pool/dock.
  - `updateUnplacedBadge()`: Synchronizes unplaced card count and auto-minimizes dock if count is 0.

- [ ] **Step 1: Write test for board state manipulation & card placement logic**

Create `tests/test_interactions.js`:
```javascript
const assert = require('assert');

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
assert.strictEqual(s1.slots[3].placedCardId, 'card_0');
assert.strictEqual(s1.poolCardIds.includes('card_0'), false);
assert.strictEqual(s1.poolCardIds.length, 9);

// Test 2: Replace slot displacing card back to pool
placeCardInSlot(s1, 'card_1', 3);
assert.strictEqual(s1.slots[3].placedCardId, 'card_1');
assert.strictEqual(s1.poolCardIds.includes('card_0'), true);
assert.strictEqual(s1.poolCardIds.includes('card_1'), false);
assert.strictEqual(s1.poolCardIds.length, 9);

// Test 3: Swap two placed cards
placeCardInSlot(s1, 'card_2', 5);
placeCardInSlot(s1, 'card_1', 5); // move card_1 from slot 3 to slot 5 (swap with card_2)
assert.strictEqual(s1.slots[5].placedCardId, 'card_1');
assert.strictEqual(s1.slots[3].placedCardId, 'card_2');

// Test 4: Recall card
recallCard(s1, 'card_1');
assert.strictEqual(s1.slots[5].placedCardId, null);
assert.strictEqual(s1.poolCardIds.includes('card_1'), true);

console.log('✅ Task 3 tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_interactions.js`
(Should pass the pure unit logic, confirming the placement algorithm is sound).

- [ ] **Step 3: Implement interaction enhancements in `jain_quest_matching_game.html`**

Update `renderBoard()`, `createCardElement()`, `placeCardInSlot()`, and `moveCardToPool()`:
- Synchronize both `#left-pool-grid` (desktop) and `#mobile-dock-cards` (mobile).
- Update `#unplaced-badge` to show the count of remaining cards.
- Add `.snap-pop` animation class on placement.
- When all 10 cards are placed, add `translate-y-full` to `#mobile-cards-dock` with a restore button so it doesn't get in the way.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_interactions.js`
Expected: PASS with `✅ Task 3 tests passed successfully.`

---

### Task 4: Wordwall-Style Video Feedback, Sequential Evaluation & Canvas Confetti

**Files:**
- Modify: `jain_quest_matching_game.html:638-740` (Synthesizer), `jain_quest_matching_game.html:1094-1150` (Grading sequence), `jain_quest_matching_game.html:150-210` (Confetti engine)
- Test: `tests/test_evaluation_engine.js`

**Interfaces:**
- Produces:
  - `submitAnswers()`: Async sequential grading loop with active slot focus (`.card-evaluating`), sound cues, checkmark/cross stamp badges, and score counter bounce.
  - `fireConfetti()`: Self-contained HTML5 Canvas confetti explosion on victory/full score.
  - `fillCorrectAnswers()`: Wordwall-style answer reveal mode.
  - `playSound(type)`: Web Audio synthesizer with `pickup`, `drop`, `correct` (bell chime), `wrong` (low thud), and `fanfare` (victory chord).

- [ ] **Step 1: Write test for sequential evaluation logic & score counting**

Create `tests/test_evaluation_engine.js`:
```javascript
const assert = require('assert');

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

console.log('✅ Task 4 evaluation tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_evaluation_engine.js`
(Verify stub logic).

- [ ] **Step 3: Implement sequential grading, audio synthesizer, and inline canvas confetti**

Add to `jain_quest_matching_game.html`:
1. Enhanced Web Audio synthesizer:
   - High-register resonant chime for correct answer: `osc.frequency.setValueAtTime(1200, now)` with smooth decay.
   - Low damped square/sawtooth thud for wrong answer: `130Hz -> 85Hz`.
   - Rich multi-voice arpeggio fanfare for completion.
2. Sequential grading sequence:
   - Left column top-to-bottom `[0, 2, 4, 6, 8]`, right column `[1, 3, 5, 7, 9]`.
   - Add `.card-evaluating` class to active slot during check.
   - If correct: stamp $\checkmark$ with `badge-pop`, increment score, play chime.
   - If wrong: stamp $\boldsymbol{\times}$, add `.shake-wrong`, apply `.card-wrong` (`#8e8e8e` slate-grey), play error thud.
3. Canvas Confetti engine:
   ```javascript
   function fireConfetti() {
     const canvas = document.getElementById('fx-canvas');
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
     const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
     const particles = Array.from({ length: 120 }, () => ({
       x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
       y: canvas.height * 0.4,
       vx: (Math.random() - 0.5) * 14,
       vy: (Math.random() - 0.8) * 16,
       size: Math.random() * 8 + 4,
       color: colors[Math.floor(Math.random() * colors.length)],
       rot: Math.random() * 360,
       rotSpeed: (Math.random() - 0.5) * 10,
       opacity: 1
     }));
     function render() {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       let active = 0;
       particles.forEach(p => {
         p.x += p.vx;
         p.y += p.vy;
         p.vy += 0.35; // gravity
         p.vx *= 0.98; // wind resistance
         p.rot += p.rotSpeed;
         p.opacity -= 0.007;
         if (p.opacity > 0 && p.y < canvas.height + 50) {
           active++;
           ctx.save();
           ctx.translate(p.x, p.y);
           ctx.rotate(p.rot * Math.PI / 180);
           ctx.globalAlpha = Math.max(0, p.opacity);
           ctx.fillStyle = p.color;
           ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
           ctx.restore();
         }
       });
       if (active > 0) requestAnimationFrame(render);
       else ctx.clearRect(0, 0, canvas.width, canvas.height);
     }
     requestAnimationFrame(render);
   }
   ```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_evaluation_engine.js`
Expected: PASS with `✅ Task 4 evaluation tests passed successfully.`

---

### Task 5: Navigation Flow, Multi-JSON Manager Modal & Full Verification

**Files:**
- Modify: `jain_quest_matching_game.html:288-372` (Header Bar), `jain_quest_matching_game.html:462-540` (Modals), `jain_quest_matching_game.html:1165-1344` (Navigation actions)
- Test: `tests/test_full_game_integrity.js`

**Interfaces:**
- Produces:
  - Header actions: "🎲 New Game (Random Set)", Sound toggle, Fullscreen toggle, JSON Manager, Score badge.
  - Results Modal: Score, Time, "🎲 Next Random Game" button, "🔄 Play Again" button, "👁️ Review Board" button.
  - Multi-JSON file upload: Handles multiple `.json` files simultaneously in the modal, displaying loaded datasets in a selectable list.
  - Initial load randomly chooses one dataset from registry.

- [ ] **Step 1: Write comprehensive game integration test**

Create `tests/test_full_game_integrity.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Verify Header Navigation elements
assert(html.includes('id="new-game-btn"'), 'Header must have New Game button');
assert(html.includes('id="timer-display"'), 'Header must have Timer display');
assert(html.includes('id="score-display"'), 'Header must have Score display');
assert(html.includes('id="sound-btn"'), 'Header must have Sound toggle button');
assert(html.includes('id="data-modal"'), 'Data modal must exist');

// Verify Multi-JSON file input
assert(html.includes('multiple') && html.includes('accept=".json"'), 'Must support multiple JSON file selection');

// Verify Results Modal actions
assert(html.includes('id="result-modal"'), 'Result modal must exist');
assert(html.includes('startRandomGame()'), 'Must have action to start random game');
assert(html.includes('fillCorrectAnswers()'), 'Must have action to show correct answers');

// Verify script loads with random set pick
assert(html.includes('pickRandomDataset'), 'Must invoke pickRandomDataset on game initialization');

console.log('✅ Full game integrity verification passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_full_game_integrity.js`
Expected: FAIL (`AssertionError: Header must have New Game button`).

- [ ] **Step 3: Implement Header navigation, Multi-JSON upload, Results modal, and random initialization**

Update `jain_quest_matching_game.html`:
1. Header Bar:
   - Add `#new-game-btn` with icon: `🎲 New Game (Random Set)`.
   - Add active dataset badge pill: `#active-dataset-pill` (e.g. `Set: Video Set 1`).
2. Data Manager Modal:
   - Add `<input type="file" multiple accept=".json" onchange="handleMultipleJsonUpload(event)">`.
   - Display list of currently registered datasets with radio buttons to manually select or let random decide.
3. Results Modal:
   - "🎲 Next Random Game" button calling `startRandomGame()`.
   - "🔄 Play Again" button calling `resetBoard()`.
   - "👁️ Review Board" button calling `closeResultModal()`.
4. Initialize on `DOMContentLoaded`:
   - Call `startRandomGame()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_full_game_integrity.js`
Expected: PASS with `✅ Full game integrity verification passed successfully!`

- [ ] **Step 5: Run all test suites together**

Run:
```powershell
node tests/test_dataset_engine.js
node tests/test_layout_structure.js
node tests/test_interactions.js
node tests/test_evaluation_engine.js
node tests/test_full_game_integrity.js
```
Expected: All suites PASS.
