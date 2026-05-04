// Approach 01-foundation.md § Phase 7 Task 7.2
// Circuit breaker memoisation + basic lifecycle assertions.
// Full lifecycle (open → half-open → close) deferred to Optional Integration test.

jest.mock('@mbai460/photoapp-server', () => ({
  services: {
    aws: {
      getBucket: jest.fn(() => ({ send: jest.fn().mockResolvedValue({}) })),
      getRekognition: jest.fn(() => ({ send: jest.fn().mockResolvedValue({}) })),
    },
  },
}));

jest.mock('../../observability/pino', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

describe('breakers.js', () => {
  let getBucketBreaker, getRekognitionBreaker;

  beforeEach(() => {
    jest.resetModules();
    // Re-mock after resetModules so fresh module loads with fresh state.
    jest.mock('@mbai460/photoapp-server', () => ({
      services: {
        aws: {
          getBucket: jest.fn(() => ({ send: jest.fn().mockResolvedValue({}) })),
          getRekognition: jest.fn(() => ({ send: jest.fn().mockResolvedValue({}) })),
        },
      },
    }));
    jest.mock('../../observability/pino', () => ({
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    }));
    ({ getBucketBreaker, getRekognitionBreaker } = require('../../services/breakers'));
  });

  test('getBucketBreaker returns a circuit breaker instance', () => {
    const b = getBucketBreaker();
    expect(typeof b.fire).toBe('function');
  });

  test('getBucketBreaker is memoised — same instance on second call', () => {
    const b1 = getBucketBreaker();
    const b2 = getBucketBreaker();
    expect(b1).toBe(b2);
  });

  test('getRekognitionBreaker returns a circuit breaker instance', () => {
    const b = getRekognitionBreaker();
    expect(typeof b.fire).toBe('function');
  });

  test('getRekognitionBreaker is memoised', () => {
    const b1 = getRekognitionBreaker();
    const b2 = getRekognitionBreaker();
    expect(b1).toBe(b2);
  });

  test('bucket breaker fires successfully when underlying client resolves', async () => {
    const b = getBucketBreaker();
    const result = await b.fire({ type: 'HeadBucketCommand', input: {} });
    expect(result).toBeDefined();
  });
});
