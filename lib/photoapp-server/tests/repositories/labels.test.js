// lib/photoapp-server/tests/repositories/labels.test.js
//
// Unit tests for labels repository — locks SQL + params + ordering
// byte-identical to Part 03's pre-extraction inline SQL.

const labelsRepo = require('../../src/repositories/labels');

describe('findByAssetId', () => {
  test('returns labels ordered by confidence DESC for the assetid', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { label: 'Animal', confidence: 99 },
        { label: 'Dog', confidence: 90 },
      ]]),
    };
    const result = await labelsRepo.findByAssetId(fakeConn, 1001);
    expect(result).toEqual([
      { label: 'Animal', confidence: 99 },
      { label: 'Dog', confidence: 90 },
    ]);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC',
      [1001]
    );
  });

  test('returns empty array when assetid has no labels', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    const result = await labelsRepo.findByAssetId(fakeConn, 1001);
    expect(result).toEqual([]);
  });
});

describe('findByLabelLike', () => {
  test('returns matching rows ordered by assetid ASC, label ASC; LIKE-substring binding', async () => {
    const fakeConn = {
      execute: jest.fn().mockResolvedValue([[
        { assetid: 1001, label: 'Animal', confidence: 99 },
        { assetid: 1002, label: 'Animal', confidence: 95 },
      ]]),
    };
    const result = await labelsRepo.findByLabelLike(fakeConn, 'animal');
    expect(result).toHaveLength(2);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC',
      ['%animal%']
    );
  });

  test('label substring is wrapped with % on both sides', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([[]]) };
    await labelsRepo.findByLabelLike(fakeConn, 'boat');
    const [, params] = fakeConn.execute.mock.calls[0];
    expect(params).toEqual(['%boat%']);
  });
});

describe('insertOne', () => {
  test('issues INSERT IGNORE with assetid + name + ROUND(confidence)', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([{}]) };
    await labelsRepo.insertOne(fakeConn, 1001, 'Animal', 99.5);
    expect(fakeConn.execute).toHaveBeenCalledWith(
      'INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))',
      [1001, 'Animal', 99.5]
    );
  });
});

describe('deleteAll', () => {
  test('issues DELETE FROM labels', async () => {
    const fakeConn = { execute: jest.fn().mockResolvedValue([{}]) };
    await labelsRepo.deleteAll(fakeConn);
    expect(fakeConn.execute).toHaveBeenCalledWith('DELETE FROM labels');
  });
});
