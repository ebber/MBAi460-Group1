// lib/photoapp-server/tests/repositories/users.test.js
//
// Unit tests for users repository — locks SQL strings + param binding +
// return shapes byte-identical to Part 03's pre-extraction behavior (CL9
// reconciliation safety net). Uses a typed fake `conn` with a mocked
// `execute` method per Approach Phase 3.1 acceptance.

const usersRepo = require('../../src/repositories/users');

describe('countAll', () => {
  test('returns user count from SELECT count(userid)', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[{ num_users: 3 }]]),
    };
    const result = await usersRepo.countAll(fakeConn);
    expect(result).toBe(3);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT count(userid) AS num_users FROM users'
    );
  });

  test('handles zero-user case', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[{ num_users: 0 }]]),
    };
    const result = await usersRepo.countAll(fakeConn);
    expect(result).toBe(0);
  });
});

describe('findAll', () => {
  test('returns users ordered by userid ASC', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
        { userid: 80002, username: 'e_ricci', givenname: 'Emanuele', familyname: 'Ricci' },
      ]]),
    };
    const result = await usersRepo.findAll(fakeConn);
    expect(result).toEqual([
      { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
      { userid: 80002, username: 'e_ricci', givenname: 'Emanuele', familyname: 'Ricci' },
    ]);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC'
    );
  });

  test('returns empty array when no users', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    const result = await usersRepo.findAll(fakeConn);
    expect(result).toEqual([]);
  });
});

describe('findById', () => {
  test('returns userid + username when found', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[{ userid: 80001, username: 'p_sarkar' }]]),
    };
    const result = await usersRepo.findById(fakeConn, 80001);
    expect(result).toEqual({ userid: 80001, username: 'p_sarkar' });
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT userid, username FROM users WHERE userid = ?',
      [80001]
    );
  });

  test('returns null when not found', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    const result = await usersRepo.findById(fakeConn, 99999);
    expect(result).toBeNull();
  });
});
