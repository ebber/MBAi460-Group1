// Approach 01-foundation.md § Phase 11 Task 11.4
// Jest globalSetup for the live layer. Exits with a clear message when the
// gate env var is not set so contributors don't accidentally run live AWS tests.
module.exports = async function () {
  if (process.env.PHOTOAPP_RUN_LIVE_TESTS !== '1') {
    // globalSetup cannot skip tests directly; the tests themselves check this env.
    // Log once so CI output is clear about why live tests are absent.
    process.stdout.write(
      '\n[live layer] PHOTOAPP_RUN_LIVE_TESTS not set — live tests will be skipped.\n\n',
    );
  }
};
