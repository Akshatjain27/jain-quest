const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// 1. Verify Landing Screen Architecture
assert(html.includes('id="landing-screen"'), 'Landing screen element must exist');
assert(html.includes('id="start-game-btn"'), 'Start game button must exist on landing screen');
assert(html.includes('launchGame'), 'launchGame function must exist');
assert(html.includes('showLandingScreen'), 'showLandingScreen function must exist');

// 2. Verify Playfield Header Navigation & Arcade Elements
assert(html.includes('id="game-playfield"'), 'Game playfield container must exist');
assert(html.includes('id="page-indicator"'), 'Header must have Page indicator');
assert(html.includes('id="score-display"'), 'Header must have Score display');
assert(html.includes('id="lifelines-container"'), 'Header must have Lifelines container');
assert(html.includes('id="countdown-timer"'), 'Header must have Countdown timer');
assert(html.includes('id="sound-btn"'), 'Header must have Sound toggle button');
assert(html.includes('id="data-modal"'), 'Data modal must exist');

// 3. Verify Two-Page Progression, Game Over, and Victory Modals
assert(html.includes('id="page-complete-banner"'), 'Page complete celebratory banner must exist');
assert(html.includes('id="gameover-modal"'), 'GameOver modal must exist');
assert(html.includes('id="victory-modal"'), 'Victory modal must exist');
assert(html.includes('loadPage'), 'loadPage progression function must exist');
assert(html.includes('triggerGameOver'), 'triggerGameOver function must exist');
assert(html.includes('triggerVictory'), 'triggerVictory function must exist');
assert(html.includes('returnToStartScreen'), 'returnToStartScreen function must exist');

// 4. Verify 20-Question Datasets & Multi-JSON Input
assert(html.includes('GAME_SETS_20'), 'GAME_SETS_20 dataset registry must exist');
assert(html.includes('pickRandomGameSet20'), 'Must invoke pickRandomGameSet20');
assert(html.includes('multiple') && html.includes('accept=".json"'), 'Must support multiple JSON file selection');

// 5. Verify Instant Validation & Lifecycle Mechanics
assert(html.includes('handleSlotAssignment'), 'handleSlotAssignment must exist');
assert(html.includes('deductLife'), 'deductLife function must exist');
assert(html.includes('resetCountdownTimer'), 'resetCountdownTimer function must exist');
assert(html.includes('pageTransitionTimeout'), 'pageTransitionTimeout variable must exist');

// 6. Verify Modern Arcade Enhancements (30s timer, 3 Lives, Exit button, Audio loop)
assert(html.includes('id="exit-game-btn"'), 'Header must have Exit button');
assert(html.includes('startBackgroundMusic'), 'Must define startBackgroundMusic');
assert(html.includes('stopBackgroundMusic'), 'Must define stopBackgroundMusic');
assert(html.includes('playGameOverSound'), 'Must define playGameOverSound');
assert(html.includes('updateLivesUI'), 'Must define updateLivesUI');
assert(html.includes('timerRemaining = 45'), 'Timer must start at 45 seconds');
assert(!html.includes('id="helper-banner"'), 'Helper banner must be removed');
assert(!html.includes('Lifeline') && !html.includes('लाइफलाइन'), 'Lifeline wording must be removed in favor of Life');

// 7. Verify index.html is completely synchronized with jain_quest_matching_game.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.strictEqual(indexHtml, html, 'index.html must match jain_quest_matching_game.html exactly');

console.log('✅ Full game integrity verification passed successfully!');
