// Sub-phase 1.0 smoke entrypoint. SIGTERM graceful shutdown + pool.end() land in
// Approach Phase 2 / Phase 7. console.log is acceptable here only because pino is
// not introduced until Approach Phase 3 § Task 3.1 — at that point this file
// switches to the pino logger.
const app = require('./app');

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`project02-server listening on :${port}`);
});
