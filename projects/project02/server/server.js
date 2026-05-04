// Sub-phase 1.0 smoke entrypoint; Approach Phase 1 (Task 1.3) added the no-console
// ESLint rule (allow: ['warn', 'error']). Startup logging stays on console.warn
// for early-boot signal until pino lands in Approach Phase 3 § Task 3.1; SIGTERM
// graceful shutdown + pool.end() land in Phase 2 / Phase 7.
const app = require('./app');

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.warn(`project02-server listening on :${port}`);
});
