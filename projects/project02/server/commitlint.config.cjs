// Conventional Commits enforcement. Scopes mirror Plan.md:
//   feat(server) | feat(client) | feat(infra) | feat(lib:photoapp-server) | feat(utils)
//   fix(*) | chore(*) | test(*) | docs(*) | refactor(*)
// Wire-up (husky commit-msg hook) is deferred — see refactor-log § sub-phase 1.x
// (Approach Phase 1). The config is in place so a future husky install can pick it
// up without further authoring.
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
