// Approach 01-foundation.md § Phase 3 Task 3.4 — OpenTelemetry stub assertions.
const { trace, enabled } = require('../../observability/tracing');

test('tracing module loads without throwing when TRACING_ENABLED is unset', () => {
  expect(typeof trace).toBe('object');
  expect(typeof trace.startSpan).toBe('function');
});

test('default state is disabled (no @opentelemetry SDK pulled in yet)', () => {
  expect(enabled).toBe(false);
});

test('no-op span responds to the contract endSpan / setAttribute / setStatus', () => {
  const span = trace.startSpan('test');
  expect(() => span.end()).not.toThrow();
  expect(() => span.setAttribute('k', 'v')).not.toThrow();
  expect(() => span.setStatus({ code: 0 })).not.toThrow();
});
