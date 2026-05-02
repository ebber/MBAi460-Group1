// lib/photoapp-server/tests/repositories/sql-characterization.test.js
//
// CHARACTERIZATION test (Optional Test Step from
// MBAi460-Group1/projects/project02/client/MetaFiles/Approach/
// 00-shared-library-extraction.md § Phase 0.3).
//
// Locks the *literal SQL strings* + parameter binding order issued by every
// repository function — separate from the unit tests in this directory,
// which assert behaviour and per-call shape. This test is intentionally
// rigid: it captures every [sql, params] tuple the repos produce and
// asserts them as plain objects.
//
// Why this exists, separately from the unit tests:
//   The unit tests use fakeConn.execute.mockResolvedValue(...) and assert
//   one call shape per scenario, mixed with row-shape assertions. A future
//   "tidy up the SQL" refactor — e.g. lowercasing keywords, renaming an
//   alias, dropping `ORDER BY assetid ASC` because the seeded fixture
//   happens to come back ordered — could in principle pass the unit tests
//   if the rows still match. It would *not* pass Gradescope's unseeded
//   grading database. This file is the single sheet of glass that says
//   "the SQL we ship is the SQL Part 03 was issuing pre-extraction."
//
// Maintenance: if you intentionally change a SQL string, update the
// expected tuple here in the same commit. The diff in this file is the
// reviewer's hook for "did you mean to change the wire-level SQL?"

const usersRepo = require('../../src/repositories/users');
const assetsRepo = require('../../src/repositories/assets');
const labelsRepo = require('../../src/repositories/labels');

// Recording fake conn — captures every execute() call as {sql, params}.
// `params` is left undefined for single-arg execute calls so that asymmetry
// (intentional, mirrors the underlying repo functions) is part of what gets
// locked here.
function makeRecordingConn(resolveValue = [[]]) {
  const conn = {
    calls: [],
    execute: jest.fn(function (sql, params) {
      conn.calls.push({ sql, params });
      return Promise.resolve(resolveValue);
    }),
  };
  return conn;
}

// ---------------------------------------------------------------------------
// users repository
// ---------------------------------------------------------------------------

describe('SQL characterization: users repository', () => {
  test('countAll', async () => {
    const conn = makeRecordingConn([[{ num_users: 0 }]]);
    await usersRepo.countAll(conn);
    expect(conn.calls).toEqual([
      { sql: 'SELECT count(userid) AS num_users FROM users', params: undefined },
    ]);
  });

  test('findAll', async () => {
    const conn = makeRecordingConn([[]]);
    await usersRepo.findAll(conn);
    expect(conn.calls).toEqual([
      { sql: 'SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC', params: undefined },
    ]);
  });

  test('findById — projection: userid + username only (uploadImage validation path)', async () => {
    const conn = makeRecordingConn([[]]);
    await usersRepo.findById(conn, 80001);
    expect(conn.calls).toEqual([
      { sql: 'SELECT userid, username FROM users WHERE userid = ?', params: [80001] },
    ]);
  });
});

// ---------------------------------------------------------------------------
// assets repository
// ---------------------------------------------------------------------------

describe('SQL characterization: assets repository', () => {
  test('findAll — passes empty params array explicitly (preserves Part 03 byte-identical call shape)', async () => {
    const conn = makeRecordingConn([[]]);
    await assetsRepo.findAll(conn);
    expect(conn.calls).toEqual([
      { sql: 'SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC', params: [] },
    ]);
  });

  test('findByUserId', async () => {
    const conn = makeRecordingConn([[]]);
    await assetsRepo.findByUserId(conn, 80001);
    expect(conn.calls).toEqual([
      { sql: 'SELECT assetid, userid, localname, bucketkey, kind FROM assets WHERE userid = ? ORDER BY assetid ASC', params: [80001] },
    ]);
  });

  test('findById — full-shape projection without kind (downloadImage path)', async () => {
    const conn = makeRecordingConn([[]]);
    await assetsRepo.findById(conn, 1001);
    expect(conn.calls).toEqual([
      { sql: 'SELECT assetid, userid, localname, bucketkey FROM assets WHERE assetid = ?', params: [1001] },
    ]);
  });

  test('existsById — minimal projection (validation-only; getImageLabels path)', async () => {
    const conn = makeRecordingConn([[]]);
    await assetsRepo.existsById(conn, 1001);
    expect(conn.calls).toEqual([
      { sql: 'SELECT assetid FROM assets WHERE assetid = ?', params: [1001] },
    ]);
  });

  test('insert — column order: userid, localname, bucketkey, kind', async () => {
    const conn = makeRecordingConn([{ insertId: 1001, affectedRows: 1 }]);
    await assetsRepo.insert(conn, {
      userid: 80001,
      localname: 'a.jpg',
      bucketkey: 'p/u-a.jpg',
      kind: 'photo',
    });
    expect(conn.calls).toEqual([
      {
        sql: 'INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)',
        params: [80001, 'a.jpg', 'p/u-a.jpg', 'photo'],
      },
    ]);
  });

  test('selectAllBucketkeys — single-arg execute (no params)', async () => {
    const conn = makeRecordingConn([[]]);
    await assetsRepo.selectAllBucketkeys(conn);
    expect(conn.calls).toEqual([
      { sql: 'SELECT bucketkey FROM assets', params: undefined },
    ]);
  });

  test('deleteAll — single-arg execute', async () => {
    const conn = makeRecordingConn([{}]);
    await assetsRepo.deleteAll(conn);
    expect(conn.calls).toEqual([
      { sql: 'DELETE FROM assets', params: undefined },
    ]);
  });

  test('resetAutoIncrement — literal AUTO_INCREMENT = 1001 (matches seed)', async () => {
    const conn = makeRecordingConn([{}]);
    await assetsRepo.resetAutoIncrement(conn);
    expect(conn.calls).toEqual([
      { sql: 'ALTER TABLE assets AUTO_INCREMENT = 1001', params: undefined },
    ]);
  });
});

// ---------------------------------------------------------------------------
// labels repository
// ---------------------------------------------------------------------------

describe('SQL characterization: labels repository', () => {
  test('findByAssetId — projection: label + confidence; ORDER BY confidence DESC', async () => {
    const conn = makeRecordingConn([[]]);
    await labelsRepo.findByAssetId(conn, 1001);
    expect(conn.calls).toEqual([
      {
        sql: 'SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC',
        params: [1001],
      },
    ]);
  });

  test('findByLabelLike — LIKE %label% with positional bind; ORDER BY assetid ASC, label ASC', async () => {
    const conn = makeRecordingConn([[]]);
    await labelsRepo.findByLabelLike(conn, 'dog');
    expect(conn.calls).toEqual([
      {
        sql: 'SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC',
        params: ['%dog%'],
      },
    ]);
  });

  test('insertOne — INSERT IGNORE; columns: assetid, label, confidence; ROUND(confidence) in VALUES', async () => {
    const conn = makeRecordingConn([{ insertId: 1, affectedRows: 1 }]);
    await labelsRepo.insertOne(conn, 1001, 'Dog', 99.5);
    expect(conn.calls).toEqual([
      {
        sql: 'INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))',
        params: [1001, 'Dog', 99.5],
      },
    ]);
  });

  test('deleteAll — single-arg execute', async () => {
    const conn = makeRecordingConn([{}]);
    await labelsRepo.deleteAll(conn);
    expect(conn.calls).toEqual([
      { sql: 'DELETE FROM labels', params: undefined },
    ]);
  });
});
