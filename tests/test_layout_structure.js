const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Verify key DOM elements exist
assert(html.includes('id="mobile-cards-dock"'), 'Mobile sticky dock element must exist');
assert(html.includes('id="unplaced-badge"'), 'Unplaced counter badge element must exist');
assert(html.includes('id="dock-toggle-btn"'), 'Dock expand/collapse toggle button must exist');
assert(html.includes('id="dock-toggle-text"'), 'Dock toggle text element must exist');
assert(html.includes('id="mobile-dock-cards"'), 'Mobile dock cards container must exist');
assert(html.includes('id="fx-canvas"'), 'FX canvas element must exist');

// Verify key CSS keyframes and animations exist
assert(html.includes('@keyframes shake-wrong'), 'shake-wrong keyframe must exist');
assert(html.includes('@keyframes snap-pop'), 'snap-pop keyframe must exist');
assert(html.includes('@keyframes badge-pop'), 'badge-pop keyframe must exist');
assert(html.includes('.selected-card'), 'selected-card class must exist');
assert(html.includes('.card-evaluating'), 'card-evaluating class must exist');

console.log('✅ Task 2 tests passed successfully.');
