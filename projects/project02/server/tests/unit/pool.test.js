// Approach 01-foundation.md § Phase 7 Task 7.1
// Tests use jest.mock to avoid needing a real photoapp-config.ini or MySQL instance.

const FAKE_INI = `
[rds]
endpoint = localhost
port_number = 3306
user_name = testuser
user_pwd = testpwd
db_name = testdb

[s3]
bucket_name = test-bucket
region_name = us-east-1
`;

// Mock fs before requiring pool so readFileSync returns the fake INI.
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => FAKE_INI),
}));

const mockEnd = jest.fn().mockResolvedValue(undefined);
const mockPool = { end: mockEnd, execute: jest.fn() };
const mockCreatePool = jest.fn(() => mockPool);
jest.mock('mysql2/promise', () => ({ createPool: mockCreatePool }));

describe('pool.js', () => {
  let getPool, closePool;

  beforeEach(() => {
    jest.resetModules();
    // Re-import after reset so module-level singleton is fresh.
    ({ getPool, closePool } = require('../../services/pool'));
    mockCreatePool.mockClear();
    mockEnd.mockClear();
  });

  test('getPool returns a pool instance', () => {
    const p = getPool();
    expect(p).toBeDefined();
    expect(mockCreatePool).toHaveBeenCalledTimes(1);
  });

  test('getPool is memoised — calling twice returns the same instance', () => {
    const p1 = getPool();
    const p2 = getPool();
    expect(p1).toBe(p2);
    expect(mockCreatePool).toHaveBeenCalledTimes(1);
  });

  test('closePool ends the pool and resets singleton', async () => {
    getPool(); // create the pool first
    await closePool();
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });

  test('closePool is idempotent — calling twice does not throw', async () => {
    getPool();
    await closePool();
    await expect(closePool()).resolves.toBeUndefined();
    expect(mockEnd).toHaveBeenCalledTimes(1); // second call is a no-op
  });

  test('pool is created with multipleStatements: true', () => {
    getPool();
    const opts = mockCreatePool.mock.calls[0][0];
    expect(opts.multipleStatements).toBe(true);
    expect(opts.connectionLimit).toBe(5);
    expect(opts.waitForConnections).toBe(true);
  });
});
