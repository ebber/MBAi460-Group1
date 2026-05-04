// Approach 01-foundation.md § Phase 11 Task 11.4
// Live regression harness (requires PHOTOAPP_RUN_LIVE_TESTS=1 + configured
// photoapp-config.ini pointing to real AWS). Expanded as routes land in
// workstream 02 and fully exercised in Phase 4.10.
// Cleans up after itself: any test rows / S3 objects use 'live-test-' prefix.

const LIVE = process.env.PHOTOAPP_RUN_LIVE_TESTS === '1';

(LIVE ? test : test.skip)('live: ping against real AWS (workstream 02)', () => {});
(LIVE ? test : test.skip)('live: full upload lifecycle against real AWS (Phase 4.10)', () => {});
