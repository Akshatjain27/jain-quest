# Set 1 & Set 2, 30s Countdown, 3 Lives, BG Music & Exit Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `jain_quest_matching_game.html` and `index.html` to use `set-1.json` and `set-2.json` (`{question, answer}` format) with 30-second timers running from 30 to 0 in large font, 3 lives, continuous background music, dramatic game over sound, header exit button, and clean "Home" popup navigation.

**Architecture:** Single self-contained HTML file featuring pre-bundled JSON datasets, generalized question/answer cards and drop slots, Web Audio ambient background music loop generator, large numeric countdown timer, and reactive game lifecycle management.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Web Audio API, HTML5 Canvas API, Tailwind CSS, Google Fonts.

## Global Constraints
- Self-contained single file: No external JS dependencies; all code in `jain_quest_matching_game.html` and mirrored in `index.html`.
- Datasets: Source from `set-1.json` and `set-2.json` using `{question, answer}` structure.
- Page Splitting: Page 1 uses items 0–9; Page 2 uses items 10–19. Both question cards and target slots must be independently shuffled on each page.
- Timer: 30 seconds per page, running from 30 down to 0, rendered in large bold font (`text-3xl sm:text-4xl`).
- Lives: Exactly 3 lives (❤️❤️❤️); wording is "Life" (not "Lifeline").
- Background music: Continuous ambient sound loop playing during active gameplay, stopping on Game Over/Victory/Home, respecting sound mute.
- Game Over sound: Dramatic descending minor tone audio effect.
- Exit button: Available in header during gameplay to return to Home screen.
- UI cleanup: Remove "How to Play" helper banner from gameplay; rename Game Over button to "Home".

---

### Task 1: Bundle `set-1.json` & `set-2.json` with `{question, answer}` Schema, Page Slicing & Shuffling

**Files:**
- Modify: `jain_quest_matching_game.html:600-750`
- Test: `tests/test_set1_set2_schema.js`

**Interfaces:**
- Produces:
  - `SET_1_SOURCE`: 20-item array from `set-1.json` with `{question, answer}` format.
  - `SET_2_SOURCE`: 20-item array from `set-2.json` with `{question, answer}` format.
  - `GAME_SETS_20`: Registered sets with `page1` (items 0–9) and `page2` (items 10–19).
  - Generalized card & slot creation: Cards display `item.question`, drop slots display `item.answer`.
  - Shuffling: Independent shuffling of question cards and answer target slots on Page 1 and Page 2.

- [ ] **Step 1: Write failing test for Set 1 & Set 2 schema and slicing**

Create `tests/test_set1_set2_schema.js`:
```javascript
const assert = require('assert');
const fs = require('fs');

const set1 = JSON.parse(fs.readFileSync('set-1.json', 'utf8'));
const set2 = JSON.parse(fs.readFileSync('set-2.json', 'utf8'));

// Verify source JSON files
assert.strictEqual(set1.length, 20, 'set-1.json must have 20 items');
assert.strictEqual(set2.length, 20, 'set-2.json must have 20 items');
assert(set1[0].question && set1[0].answer, 'Items must use {question, answer} format');
assert(set2[0].question && set2[0].answer, 'Items must use {question, answer} format');

// Verify HTML integration
const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');
assert(html.includes('SET_1_SOURCE'), 'HTML must contain SET_1_SOURCE');
assert(html.includes('SET_2_SOURCE'), 'HTML must contain SET_2_SOURCE');
assert(html.includes('item.question'), 'Card creation must reference item.question');
assert(html.includes('item.answer'), 'Slot creation must reference item.answer');

console.log('✅ Task 1: Set 1 & Set 2 schema and slicing tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_set1_set2_schema.js`
Expected: FAIL.

- [ ] **Step 3: Implement Set 1 & Set 2 datasets and generalized `{question, answer}` rendering**

Update `jain_quest_matching_game.html`:
1. Bundle `SET_1_SOURCE` directly from `set-1.json`.
2. Bundle `SET_2_SOURCE` directly from `set-2.json`.
3. Build `GAME_SETS_20`:
   - Set 1: `page1 = SET_1_SOURCE.slice(0, 10)`, `page2 = SET_1_SOURCE.slice(10, 20)`.
   - Set 2: `page1 = SET_2_SOURCE.slice(0, 10)`, `page2 = SET_2_SOURCE.slice(10, 20)`.
4. Update `initGameBoard(dataset)`:
   - Maps `item.question` to card and `item.answer` to `correctAnswer`.
   - Shuffles cards (`shuffleArray(cards.map(c => c.id))`).
   - Independently shuffles target slot answers (`shuffleArray(dataset.map(item => item.answer.trim()))`).
5. Update `createCardElement()` to render `card.question` and target slots to render `slot.answer`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_set1_set2_schema.js`
Expected: PASS.

---

### Task 2: Large 30-Second Countdown Timer (30-0), 3 Lives & "Life" Wording

**Files:**
- Modify: `jain_quest_matching_game.html:280-350` (Header HTML), `jain_quest_matching_game.html:1250-1340` (Timer & Life functions)
- Test: `tests/test_timer30_lives3.js`

**Interfaces:**
- Produces:
  - 30-second countdown: `timerRemaining = 30;`, running from `30` down to `0`.
  - Timer UI element: `#countdown-timer` styled with `text-3xl sm:text-4xl font-extrabold font-mono text-amber-300`.
  - 3 Lives: `gameState.lives = 3;` displaying `3 Life` with `❤️❤️❤️`.
  - Wording: All references to "Lifeline" / "लाइफलाइन" changed to "Life" / "लाइफ".

- [ ] **Step 1: Write failing test for 30s timer and 3 lives**

Create `tests/test_timer30_lives3.js`:
```javascript
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

assert(html.includes('timerRemaining = 30'), 'Timer must start at 30 seconds');
assert(html.includes('text-3xl') || html.includes('text-4xl'), 'Timer must use large font');
assert(html.includes('gameState.lives = 3'), 'Must start with 3 lives');
assert(!html.includes('Lifeline') && !html.includes('लाइफलाइन'), 'Wording must use Life instead of Lifeline');

console.log('✅ Task 2: 30s timer and 3 lives tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_timer30_lives3.js`
Expected: FAIL.

- [ ] **Step 3: Implement 30s countdown, typography, and 3 lives wording**

Update `jain_quest_matching_game.html`:
1. In header and landing rules:
   - Change "1 मिनट प्रति पेज" to "30 सेकंड प्रति पेज".
   - Change "3 लाइफलाइन" to "3 लाइफ (3 Life)".
   - Change `#countdown-timer` container to display prominent integer digits (e.g. `30` down to `0`) styled with `text-3xl sm:text-4xl font-extrabold font-mono tracking-wider`.
2. In script:
   - `timerRemaining = 30;` on game start and Page 2 load.
   - `updateTimerDisplay()` renders `${timerRemaining}` directly.
   - Triggers pulse at $\le 10$ seconds; triggers `triggerGameOver('timeout')` at `0`.
   - `gameState.lives = 3;` with 3 hearts.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_timer30_lives3.js`
Expected: PASS.

---

### Task 3: Continuous Ambient Background Music & Dramatic Game Over Sound

**Files:**
- Modify: `jain_quest_matching_game.html:650-780` (Audio Synthesizer section)
- Test: `tests/test_bg_music_gameover_sound.js`

**Interfaces:**
- Produces:
  - `startBackgroundMusic()`: Generates continuous ambient melodic looping sound using Web Audio API oscillators and gain nodes.
  - `stopBackgroundMusic()`: Stops / pauses background music smoothly.
  - `playGameOverSound()`: Plays dramatic descending minor harmonic chord sequence on Game Over.
  - State hooks: Music starts on `launchGame()`, pauses/mutes on `toggleSound()`, stops on `triggerGameOver()`, `triggerVictory()`, and `returnToStartScreen()`.

- [ ] **Step 1: Write test for audio functions in HTML**

Create `tests/test_bg_music_gameover_sound.js`:
```javascript
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

assert(html.includes('startBackgroundMusic'), 'Must have startBackgroundMusic function');
assert(html.includes('stopBackgroundMusic'), 'Must have stopBackgroundMusic function');
assert(html.includes('playGameOverSound'), 'Must have playGameOverSound function');

console.log('✅ Task 3: Background music and game over sound tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_bg_music_gameover_sound.js`
Expected: FAIL.

- [ ] **Step 3: Implement Web Audio background music loop and game over sound**

Add to `jain_quest_matching_game.html`:
1. `startBackgroundMusic()`:
   - Gentle arpeggio/drone loop playing soothing pentatonic tones (e.g. C4, E4, G4, A4) with low-pass filter and soft gain (`0.06` volume).
   - Only plays if `soundEnabled === true`.
2. `stopBackgroundMusic()`:
   - Cleanly ramps down gain and disconnects oscillators/timers.
3. `playGameOverSound()`:
   - Descending minor sequence: Eb4 $\rightarrow$ C4 $\rightarrow$ Ab3 $\rightarrow$ F3 with resonant bass decay.
4. Hook into game lifecycle:
   - `launchGame()` calls `startBackgroundMusic()`.
   - `triggerGameOver()` calls `stopBackgroundMusic()` and `playGameOverSound()`.
   - `triggerVictory()` and `returnToStartScreen()` call `stopBackgroundMusic()`.
   - `toggleSound()` toggles background music along with sound effects.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_bg_music_gameover_sound.js`
Expected: PASS.

---

### Task 4: Exit Button, UI Cleanup (Remove gameplay rules), Home Button on Modals

**Files:**
- Modify: `jain_quest_matching_game.html:280-450` (Header & Modals HTML)
- Test: `tests/test_exit_home_nav.js`

**Interfaces:**
- Produces:
  - Exit button in gameplay header: `#exit-game-btn` calling `returnToStartScreen()`.
  - Removed `#helper-banner` from gameplay playfield.
  - Game Over modal button: labeled "Home" / "होम (Home)" calling `returnToStartScreen()`.
  - Victory modal button: labeled "Home" / "होम (Home)".

- [ ] **Step 1: Write test for exit button, removed helper banner, and modal Home button**

Create `tests/test_exit_home_nav.js`:
```javascript
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

assert(html.includes('id="exit-game-btn"'), 'Header must have exit button');
assert(html.includes('returnToStartScreen()'), 'Exit button must return to home');
assert(!html.includes('id="helper-banner"'), 'Helper banner must be removed from playfield');
assert(html.includes('>Home</button>') || html.includes('होम (Home)</button>'), 'Modal button must be labeled Home');

console.log('✅ Task 4: Exit button and Home navigation tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_exit_home_nav.js`
Expected: FAIL.

- [ ] **Step 3: Implement Exit button, remove helper banner, and update modal buttons**

Update `jain_quest_matching_game.html`:
1. In `<header>` inside `#game-playfield`:
   - Add `#exit-game-btn`:
     ```html
     <button id="exit-game-btn" onclick="returnToStartScreen()" class="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs sm:text-sm font-bold border border-amber-600/40 flex items-center gap-1 shadow transition" title="Return to Home">
       <span>🚪 Exit</span>
     </button>
     ```
2. Remove `<div id="helper-banner">...</div>` from `#game-playfield`.
3. In `#gameover-modal`, change button text to `🏠 होम (Home)`.
4. In `#victory-modal`, change button text to `🏠 होम (Home)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_exit_home_nav.js`
Expected: PASS.

---

### Task 5: Master Verification, Sync to `index.html`, and Git Push

**Files:**
- Modify: `index.html` (copy updated `jain_quest_matching_game.html`), `tests/test_all_suites.js`
- Test: Full test suite

**Interfaces:**
- Produces:
  - Updated test suites reflecting new 30s timer, 3 lives, `{question, answer}` format, and Exit navigation.
  - Byte-for-byte synchronization between `jain_quest_matching_game.html` and `index.html`.
  - All test suites passing with 100% success.
  - Git commit and push to `main` on GitHub.

- [ ] **Step 1: Update existing test suites for new schema and rules**

Update tests:
- `tests/test_20q_datasets.js`
- `tests/test_landing_ui.js`
- `tests/test_lifelines_timer.js`
- `tests/test_instant_validation.js`
- `tests/test_progression_flow.js`
- `tests/test_full_game_integrity.js`
- `tests/test_all_suites.js`

- [ ] **Step 2: Run all test suites**

Run: `node tests/test_all_suites.js`
Expected: ALL PASS.

- [ ] **Step 3: Copy `jain_quest_matching_game.html` to `index.html`**

- [ ] **Step 4: Commit changes to git and push to `main` on GitHub**
