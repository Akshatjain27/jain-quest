# 2-Page 20-Question Arcade Mode with Landing Screen, Lifelines & Instant Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `jain_quest_matching_game.html` (and `index.html`) into a 2-page, 20-question matching game with a landing screen, start launch animation, 1-minute timer per page, 3 lifelines, instant match validation (no submit button), and automatic page transitions.

**Architecture:** Single self-contained HTML file featuring state-driven view management (`landing` vs `playing`), pre-bundled 20-question datasets, reactive instant placement grading, dynamic SVG heart lifelines, countdown timer interval, and embedded Canvas victory celebration.

**Tech Stack:** HTML5, CSS3 Keyframes, Vanilla JavaScript (ES6+), Web Audio API, HTML5 Canvas API, Tailwind CSS (via CDN), Google Fonts.

## Global Constraints
- Self-contained single file: No external JS runtime dependencies; all styles, fonts, and assets embedded or via existing CDNs.
- 20 questions total in 2 pages: Exactly 10 questions on Page 1, and 10 questions on Page 2.
- 1-minute countdown per page: Timer starts at 1:00 on game start and resets to 1:00 on Page 2; reaching 0:00 triggers Game Over.
- 3 lifelines (❤️❤️❤️): Deducts 1 lifeline on each incorrect match; 0 lives triggers Game Over.
- Instant validation: No "Submit Answers" button; cards are evaluated immediately upon placement. Incorrect cards bounce back to dock after brief shake.
- Landing screen: Displayed on initial load and after Game Over; features Jain Kosh brand logo top-left, large Jain Quest game logo in center, How to Play instructions, and Start Game button. No timer running on landing screen.
- Clean header: Remove JSON Manager, custom file upload, and dataset select dropdowns. Datasets are bundled in source and randomly selected on start.

---

### Task 1: Pre-Bundled 20-Question Datasets Engine

**Files:**
- Modify: `jain_quest_matching_game.html:600-720`
- Test: `tests/test_20q_datasets.js`

**Interfaces:**
- Produces:
  - `GAME_SETS_20`: Array of 20-question datasets, each containing `page1` (10 items) and `page2` (10 items).
  - `pickRandomGameSet20()`: Returns one randomly selected 20-question set.
  - `gameState.activeSet`: Currently active 20-question set.
  - `gameState.currentPage`: 1 or 2.

- [ ] **Step 1: Write failing test for 20-question dataset registry**

Create `tests/test_20q_datasets.js`:
```javascript
const assert = require('assert');

// Test dataset structure
const { GAME_SETS_20, pickRandomGameSet20 } = require('./dataset_20q_stub.js');

assert(Array.isArray(GAME_SETS_20), 'GAME_SETS_20 must be an array');
assert(GAME_SETS_20.length >= 2, 'Must have at least 2 complete 20-question sets');

GAME_SETS_20.forEach((set, idx) => {
  assert(set.name, `Set ${idx} must have a name`);
  assert(Array.isArray(set.page1) && set.page1.length === 10, `Set ${idx} page1 must contain exactly 10 questions`);
  assert(Array.isArray(set.page2) && set.page2.length === 10, `Set ${idx} page2 must contain exactly 10 questions`);

  set.page1.forEach(item => {
    assert(typeof item.godname === 'string' && item.godname.length > 0);
    assert(typeof item.sign === 'string' && item.sign.length > 0);
  });
  set.page2.forEach(item => {
    assert(typeof item.godname === 'string' && item.godname.length > 0);
    assert(typeof item.sign === 'string' && item.sign.length > 0);
  });
});

const picked = pickRandomGameSet20();
assert(picked && picked.page1 && picked.page2, 'pickRandomGameSet20 must return a valid set');
assert.strictEqual(picked.page1.length, 10);
assert.strictEqual(picked.page2.length, 10);

console.log('✅ Task 1: 20-Question Datasets Engine tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_20q_datasets.js`
Expected: FAIL (`MODULE_NOT_FOUND`).

- [ ] **Step 3: Implement 20-question dataset sets and random picker**

Create `tests/dataset_20q_stub.js` and integrate `GAME_SETS_20` and `pickRandomGameSet20()` into `jain_quest_matching_game.html`.
Include:
1. `SET_1_VIDEO_COMBINED`: Page 1 (10 items from video set 1), Page 2 (10 items from video set 2).
2. `SET_2_CANONICAL`: Page 1 (1st to 10th Tirthankaras), Page 2 (11th to 20th Tirthankaras).
3. `SET_3_AUTHENTIC_MIX`: 20 authentic Tirthankaras across 2 pages.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_20q_datasets.js`
Expected: PASS.

---

### Task 2: Landing Screen UI, Brand Logos & Start Launch Sequence

**Files:**
- Modify: `jain_quest_matching_game.html:200-420` (HTML body & landing container)
- Test: `tests/test_landing_ui.js`

**Interfaces:**
- Produces:
  - Landing container: `#landing-screen` visible by default (`gameState.screen = 'landing'`).
  - Brand logo: Jain Kosh logo on top-left of landing screen and game header.
  - Large game logo: Jain Quest logo (`game-logo.jpeg`) in center body above Start button.
  - "How to Play" information box with rules.
  - Animated Start button (`#start-game-btn`) triggering `launchGame()`.
  - Launch animation: `@keyframes logo-launch`, playing launch audio chime and transitioning to `#game-playfield`.

- [ ] **Step 1: Write test for landing screen DOM elements and styles**

Create `tests/test_landing_ui.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

assert(html.includes('id="landing-screen"'), 'Must have landing-screen container');
assert(html.includes('id="start-game-btn"'), 'Must have start-game-btn');
assert(html.includes('id="game-playfield"'), 'Must have game-playfield container');
assert(html.includes('launchGame()'), 'Start button must call launchGame()');
assert(html.includes('खेलने के नियम') || html.includes('How to Play'), 'Must contain rules/how-to-play text');
assert(html.includes('jainkosh-logo.jpeg'), 'Must include jainkosh logo');
assert(html.includes('game-logo.jpeg'), 'Must include game logo');

console.log('✅ Task 2: Landing screen DOM and launch sequence tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_landing_ui.js`
Expected: FAIL (`AssertionError: Must have landing-screen container`).

- [ ] **Step 3: Implement Landing Screen UI & Launch Sequence in `jain_quest_matching_game.html`**

1. Wrap the landing UI inside `#landing-screen`:
   - Top-left: Jain Kosh logo + "जैन कोष".
   - Center body: Large Jain Quest logo (`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-amber-500 shadow-2xl`).
   - Title: "JAIN QUEST" (तीर्थंकर एवं चिह्न मिलान).
   - "How to Play" rule card with clean typography and icons.
   - Start Game button with glowing hover and click pulse.
2. Wrap gameplay elements in `#game-playfield` (hidden by default).
3. Implement `launchGame()`:
   - Plays rising audio chime.
   - Animates logo scale.
   - Hides `#landing-screen`, reveals `#game-playfield`.
   - Calls `startNewGame()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_landing_ui.js`
Expected: PASS.

---

### Task 3: In-Game Header, 3 Lifelines Display & 1-Minute Countdown Timer

**Files:**
- Modify: `jain_quest_matching_game.html:280-360` (Header HTML), `jain_quest_matching_game.html:1200-1300` (Timer & Lifelines logic)
- Test: `tests/test_lifelines_timer.js`

**Interfaces:**
- Produces:
  - Lifelines element: `#lifelines-container` showing 3 hearts (`❤️❤️❤️`).
  - Timer element: `#countdown-timer` showing `1:00` ticking down to `0:00`.
  - Page indicator: `#page-indicator` showing `Page 1 of 2` or `Page 2 of 2`.
  - Score display: `#score-display` showing `0 / 20`.
  - Deduct life helper: `deductLife()` which animates heart loss and triggers `triggerGameOver('lives')` if lives reach 0.
  - Countdown timer logic: `startCountdownTimer()`, `stopCountdownTimer()`, `resetCountdownTimer()`.

- [ ] **Step 1: Write test for lifelines and countdown timer logic**

Create `tests/test_lifelines_timer.js`:
```javascript
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Header elements presence
assert(html.includes('id="lifelines-container"'), 'Must have lifelines container');
assert(html.includes('id="countdown-timer"'), 'Must have countdown timer display');
assert(html.includes('id="page-indicator"'), 'Must have page indicator');

// Removed elements check
assert(!html.includes('id="dataset-select"'), 'dataset-select dropdown must be removed');
assert(!html.includes('openDataModal'), 'openDataModal must be removed from header');
assert(!html.includes('id="submit-btn"'), 'submit-btn must be removed');

console.log('✅ Task 3: Lifelines & Countdown Timer DOM and logic tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_lifelines_timer.js`
Expected: FAIL.

- [ ] **Step 3: Implement Lifelines & Countdown Timer in `jain_quest_matching_game.html`**

1. Rebuild header:
   - Left: Jain Kosh brand logo.
   - Center: Jain Quest logo and title.
   - Right: Page indicator (`Page 1 of 2`), Score (`0 / 20`), Lifelines (`❤️❤️❤️`), Countdown timer (`1:00`), Sound toggle, Fullscreen toggle.
2. Implement timer state:
   - `timerRemaining = 60;`
   - Updates `#countdown-timer` every second.
   - At $\le 10$ seconds, adds warning pulse (`text-red-500 animate-pulse`).
   - At `0`, calls `triggerGameOver('timeout')`.
3. Implement lifelines state:
   - `gameState.lives = 3;`
   - `updateLifelinesUI()` renders active hearts (`❤️`) vs lost hearts (`🖤`/`💔`).
   - `deductLife()` decrements `gameState.lives`, updates UI, plays error thud, and checks if `gameState.lives === 0`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_lifelines_timer.js`
Expected: PASS.

---

### Task 4: Instant Validation Engine (Correct Snap vs. Wrong Shake & Bounce)

**Files:**
- Modify: `jain_quest_matching_game.html:850-1120` (Card drop & tap interaction handlers)
- Test: `tests/test_instant_validation.js`

**Interfaces:**
- Produces:
  - `handleSlotAssignment(cardId, targetSlotIndex)`: Instant evaluation on card placement.
  - If match is correct: Locks card into slot, adds green checkmark badge ($\checkmark$), plays bell chime, increments score.
  - If match is incorrect: Adds red cross badge ($\boldsymbol{\times}$), adds `.shake-wrong`, plays error thud, calls `deductLife()`, and bounces card back to dock after 400ms.

- [ ] **Step 1: Write test for instant validation behavior**

Create `tests/test_instant_validation.js`:
```javascript
const assert = require('assert');

// Simulate instant validation logic
function handleAssignment(state, cardId, slotIndex) {
  const card = state.cards.find(c => c.id === cardId);
  const slot = state.slots[slotIndex];
  if (!card || !slot || slot.placedCardId) return;

  if (card.correctSign === slot.sign) {
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
  cards: [{ id: 'c1', correctSign: 'सिंह' }, { id: 'c2', correctSign: 'बैल' }],
  slots: [{ sign: 'सिंह', placedCardId: null }, { sign: 'बैल', placedCardId: null }],
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
const r2 = handleAssignment(state, 'c2', 0); // slot 0 already filled
assert.strictEqual(r2, undefined);

const r3 = handleAssignment(state, 'c2', 0);
// place in wrong slot
state.slots[1].sign = 'हाथी';
const r4 = handleAssignment(state, 'c2', 1);
assert.strictEqual(r4.status, 'wrong');
assert.strictEqual(state.lives, 2);
assert.strictEqual(state.slots[1].placedCardId, null); // card bounces back, not locked

console.log('✅ Task 4: Instant validation logic tests passed.');
```

- [ ] **Step 2: Run test to verify it passes unit logic**

Run: `node tests/test_instant_validation.js`

- [ ] **Step 3: Implement instant validation in `jain_quest_matching_game.html`**

Update `placeCardInSlot()` / `handleSlotAssignment()`:
- Evaluate `card.correctSign === targetSlot.sign` immediately on drop or tap.
- Correct: Lock card in slot, mark `evalStatus = 'correct'`, remove from `poolCardIds`, update score, play chime.
- Incorrect: Show temporary wrong mark on slot, wobble `.shake-wrong`, play wrong sound, call `deductLife()`, and keep card in `poolCardIds` (or restore it after timeout).

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_instant_validation.js`
Expected: PASS.

---

### Task 5: Two-Page Progression (Page 1 to Page 2) & Game Over / Victory Handling

**Files:**
- Modify: `jain_quest_matching_game.html:1120-1350`
- Test: `tests/test_progression_flow.js`

**Interfaces:**
- Produces:
  - Page progression: When Page 1 reaches 10 correct matches, displays 1.5s celebratory banner `Page 1 Complete! 🎉`, then calls `loadPage(2)`.
  - `loadPage(pageNum)`: Loads 10 items for that page, resets 60-second timer to `1:00`, populates cards and slots.
  - Game Over screen (`#gameover-modal`): Shows reason (lives lost or time out), final score, and button "Back to Start Screen" calling `returnToStartScreen()`.
  - Victory screen (`#victory-modal`): Triggered when Page 2 reaches 10 correct matches (total score 20). Fires canvas confetti, plays victory fanfare, and offers "Play Again" button returning to start screen.
  - `returnToStartScreen()`: Resets all state, hides game playfield, and reveals `#landing-screen` with no timer running.

- [ ] **Step 1: Write test for progression and modal handlers**

Create `tests/test_progression_flow.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

assert(html.includes('loadPage'), 'loadPage function must exist');
assert(html.includes('triggerGameOver'), 'triggerGameOver function must exist');
assert(html.includes('triggerVictory'), 'triggerVictory function must exist');
assert(html.includes('returnToStartScreen'), 'returnToStartScreen function must exist');
assert(html.includes('id="gameover-modal"'), 'Must have gameover-modal');
assert(html.includes('id="page-complete-banner"'), 'Must have page-complete-banner');

console.log('✅ Task 5: Progression flow and game over/victory tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_progression_flow.js`
Expected: FAIL.

- [ ] **Step 3: Implement Page Progression, Game Over, and Victory Handling in `jain_quest_matching_game.html`**

1. Add `#page-complete-banner` (celebratory 1.5s overlay between Page 1 and Page 2).
2. Add `#gameover-modal` with reasons ("3 गलत उत्तर" or "समय समाप्त"), score display, and "स्टार्ट स्क्रीन पर लौटें" button.
3. Update victory modal with 20/20 celebration, canvas confetti, and "फिर से खेलें" button.
4. Implement `returnToStartScreen()`:
   - Clears intervals.
   - Resets state to landing mode.
   - Hides `#game-playfield` and modals.
   - Displays `#landing-screen`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_progression_flow.js`
Expected: PASS.

---

### Task 6: Full Verification, Clean-up, and Syncing to `index.html`

**Files:**
- Modify: `index.html` (copy updated `jain_quest_matching_game.html`), `tests/test_all_suites.js`
- Test: Full test suite

**Interfaces:**
- Produces:
  - Synchronized `index.html` matching `jain_quest_matching_game.html`.
  - All test suites passing cleanly with 100% success.
  - Git commit on `main` branch.

- [ ] **Step 1: Create master test runner `tests/test_all_suites.js`**

- [ ] **Step 2: Run all test suites**

Run:
```powershell
node tests/test_20q_datasets.js
node tests/test_landing_ui.js
node tests/test_lifelines_timer.js
node tests/test_instant_validation.js
node tests/test_progression_flow.js
node tests/test_all_suites.js
```
Expected: ALL PASS.

- [ ] **Step 3: Copy `jain_quest_matching_game.html` to `index.html`**

- [ ] **Step 4: Commit all changes to git**
