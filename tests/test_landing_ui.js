const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('jain_quest_matching_game.html', 'utf8');

// Core containers
assert(html.includes('id="landing-screen"'), 'Must have landing-screen container');
assert(html.includes('id="start-game-btn"'), 'Must have start-game-btn');
assert(html.includes('id="game-playfield"'), 'Must have game-playfield container');
assert(html.includes('launchGame()'), 'Start button must call launchGame()');

// Rules and text
assert(html.includes('खेलने के नियम') || html.includes('How to Play'), 'Must contain rules/how-to-play text');
assert(html.includes('20') && (html.includes('प्रश्न') || html.includes('Questions')), 'Must mention 20 questions');
assert(html.includes('3') && (html.includes('लाइफ') || html.includes('Life') || html.includes('❤️')), 'Must mention 3 lives');
assert(html.includes('45') && (html.includes('सेकंड') || html.includes('45s')), 'Must mention 45s timer per page');

// Brand and game logos
assert(html.includes('jainkosh-logo.jpeg'), 'Must include jainkosh logo');
assert(html.includes('game-logo.jpeg'), 'Must include game logo');

// Animation & JS functions
assert(html.includes('logo-launch'), 'Must include logo-launch keyframes / class');
assert(html.includes('function launchGame()'), 'Must define launchGame function');
assert(html.includes("screen: 'landing'") || html.includes('screen = \'landing\''), 'Must initialize screen to landing');

console.log('✅ Task 2: Landing screen DOM and launch sequence tests passed.');
