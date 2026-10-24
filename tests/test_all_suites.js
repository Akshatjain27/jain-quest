const { execSync } = require('child_process');

const suites = [
  'tests/test_20q_datasets.js',
  'tests/test_landing_ui.js',
  'tests/test_lifelines_timer.js',
  'tests/test_instant_validation.js',
  'tests/test_progression_flow.js',
  'tests/test_full_game_integrity.js',
  'tests/test_dataset_engine.js',
  'tests/test_layout_structure.js',
  'tests/test_interactions.js',
  'tests/test_evaluation_engine.js',
  'tests/test_direct_execution.js'
];

console.log('🚀 Running all test suites for Jain Quest 20-Question Arcade Game...\n');

let failed = 0;
suites.forEach(suite => {
  try {
    const out = execSync(`node ${suite}`, { encoding: 'utf8' });
    console.log(`✅ ${suite}`);
  } catch (err) {
    console.error(`❌ ${suite} FAILED:\n`, err.stdout || err.message);
    failed++;
  }
});

if (failed > 0) {
  console.error(`\n❌ ${failed} test suite(s) failed.`);
  process.exit(1);
} else {
  console.log(`\n🎉 All ${suites.length} test suites passed cleanly!`);
  process.exit(0);
}
