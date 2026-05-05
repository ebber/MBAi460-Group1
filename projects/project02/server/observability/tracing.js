// Approach 01-foundation.md § Phase 3 Task 3.4 — OpenTelemetry STUB.
// Real OTel SDK initialisation is deferred to workstream 04 (engineering
// surface). This module intentionally exposes a no-op API so app.js / route
// code can write `trace.startSpan(...)` patterns that compile and run
// without a tracer backend. When workstream 04 lands, this module is replaced
// with @opentelemetry/sdk-node + OTLP exporter wiring; the public API
// (trace.startSpan, trace.endSpan) stays stable so callers don't churn.
//
// No @opentelemetry/* npm dependency is required at this stub stage —
// adding it would pull in tracer plumbing we don't use yet.

const enabled = process.env.TRACING_ENABLED === '1';

const noopSpan = {
  end: () => {},
  setAttribute: () => {},
  setStatus: () => {},
  recordException: () => {},
};

const trace = {
  startSpan: (_name, _attrs) => noopSpan,
  endSpan: (_span) => {},
};

module.exports = {
  enabled,
  trace,
};
