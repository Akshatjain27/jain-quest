const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Verify Header Navigation elements
assert(html.includes('id="new-game-btn"'), 'Header must have New Game button');
assert(html.includes('id="active-dataset-pill"'), 'Header must have active dataset pill');
assert(html.includes('id="timer-display"'), 'Header must have Timer display');
assert(html.includes('id="score-display"'), 'Header must have Score display');
assert(html.includes('id="sound-btn"'), 'Header must have Sound toggle button');
assert(html.includes('id="data-modal"'), 'Data modal must exist');

// Verify Multi-JSON file input
assert(html.includes('multiple') && html.includes('accept=".json"'), 'Must support multiple JSON file selection');

// Verify Results Modal actions
assert(html.includes('id="result-modal"'), 'Result modal must exist');
assert(html.includes('startRandomGame'), 'Must have action to start random game');
assert(html.includes('fillCorrectAnswers'), 'Must have action to show correct answers');

// Verify script loads with random set pick
assert(html.includes('pickRandomDataset'), 'Must invoke pickRandomDataset on game initialization');

console.log('✅ Full game integrity verification passed successfully!');
