// lib/photoapp-server/tests/repositories/assets.test.js
//
// Unit tests for assets repository — locks SQL + params + ordering
// byte-identical to Part 03's pre-extraction inline SQL.

const assetsRepo = require('../../src/repositories/assets');

describe('findAll', () => {
  test('returns assets ordered by assetid ASC; includes kind', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg', kind: 'photo' },
      ]]),
    };
    const result = await assetsRepo.findAll(fakeConn);
    expect(result).toEqual([
      { assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg', kind: 'photo' },
    ]);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC',
      []
    );
  });
});

describe('findByUserId', () => {
  test('returns assets for a specific user, ordered by assetid ASC; parameterized WHERE', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { assetid: 1001, userid: 80001, localname: 'a.jpg', bucketkey: 'p/u-a.jpg', kind: 'photo' },
      ]]),
    };
    const result = await assetsRepo.findByUserId(fakeConn, 80001);
    expect(result).toHaveLength(1);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT assetid, userid, localname, bucketkey, kind FROM assets WHERE userid = ? ORDER BY assetid ASC',
      [80001]
    );
  });
});

describe('findById', () => {
  test('returns asset (without kind) when found', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg' },
      ]]),
    };
    const result = await assetsRepo.findById(fakeConn, 1001);
    expect(result).toEqual({
      assetid: 1001,
      userid: 80001,
      localname: '01degu.jpg',
      bucketkey: 'p_sarkar/uuid-01degu.jpg',
    });
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT assetid, userid, localname, bucketkey FROM assets WHERE assetid = ?',
      [1001]
    );
  });

  test('returns null when not found', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    const result = await assetsRepo.findById(fakeConn, 99999);
    expect(result).toBeNull();
  });
});

describe('existsById', () => {
  test('returns minimal {assetid} when found (validation-only projection)', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[{ assetid: 1001 }]]),
    };
    const result = await assetsRepo.existsById(fakeConn, 1001);
    expect(result).toEqual({ assetid: 1001 });
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT assetid FROM assets WHERE assetid = ?',
      [1001]
    );
  });

  test('returns null when not found', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    const result = await assetsRepo.existsById(fakeConn, 99999);
    expect(result).toBeNull();
  });
});

describe('insert', () => {
  test('inserts asset and returns OkPacket with insertId', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([{ insertId: 1001, affectedRows: 1 }]),
    };
    const result = await assetsRepo.insert(fakeConn, {
      userid: 80001,
      localname: '01degu.jpg',
      bucketkey: 'p_sarkar/uuid-01degu.jpg',
      kind: 'photo',
    });
    expect(result.insertId).toBe(1001);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)',
      [80001, '01degu.jpg', 'p_sarkar/uuid-01degu.jpg', 'photo']
    );
  });
});

describe('selectAllBucketkeys', () => {
  test('returns array of bucketkey strings', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { bucketkey: 'p/u-a.jpg' },
        { bucketkey: 'p/u-b.pdf' },
      ]]),
    };
    const result = await assetsRepo.selectAllBucketkeys(fakeConn);
    expect(result).toEqual(['p/u-a.jpg', 'p/u-b.pdf']);
    expect(fakeConn.execute).toHaveBeenCalledWith('SELECT bucketkey FROM assets');
  });

  test('returns empty array when no assets', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    const result = await assetsRepo.selectAllBucketkeys(fakeConn);
    expect(result).toEqual([]);
  });
});

describe('deleteAll', () => {
  test('issues DELETE FROM assets', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([{}]) };
    await assetsRepo.deleteAll(fakeConn);
    expect(fakeConn.execute).toHaveBeenCalledWith('DELETE FROM assets');
  });
});

describe('resetAutoIncrement', () => {
  test('issues ALTER TABLE assets AUTO_INCREMENT = 1001', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([{}]) };
    await assetsRepo.resetAutoIncrement(fakeConn);
    expect(fakeConn.execute).toHaveBeenCalledWith('ALTER TABLE assets AUTO_INCREMENT = 1001');
  });
});
