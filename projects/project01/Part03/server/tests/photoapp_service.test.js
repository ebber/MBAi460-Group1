jest.mock('../services/aws');
jest.mock('../middleware/upload');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(() => Buffer.from('fake-bytes')),
}));

const aws = require('../services/aws');
const upload = require('../middleware/upload');
const { getPing, listUsers, listImages, getImageLabels, searchImages, uploadImage, downloadImage, deleteAll } = require('../services/photoapp');

describe('getPing()', () => {
  test('returns counts from S3 and MySQL', async () => {
    const fakeBucket = { send: jest.fn().mockResolvedValue({ KeyCount: 5 }) };
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([[{ num_users: 3 }]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getBucket.mockReturnValue(fakeBucket);
    aws.getBucketName.mockReturnValue('test-bucket');
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await getPing();

    expect(result).toEqual({ s3_object_count: 5, user_count: 3 });
    expect(fakeDb.end).toHaveBeenCalled();
  });
});

describe('listUsers()', () => {
  test('returns user objects ordered by userid', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([
        [{ userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' }],
      ]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await listUsers();

    expect(result).toEqual([
      { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
    ]);
    expect(fakeDb.execute).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC/)
    );
    expect(fakeDb.end).toHaveBeenCalled();
  });
});

describe('listImages()', () => {
  test('without userid: SELECTs all assets, includes kind, ORDER BY assetid ASC', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([
        [{ assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg', kind: 'photo' }],
      ]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await listImages();

    expect(result).toEqual([
      { assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg', kind: 'photo' },
    ]);
    const [sql, params] = fakeDb.execute.mock.calls[0];
    expect(sql).toMatch(/SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC/);
    expect(sql).not.toMatch(/WHERE/);
    expect(params).toEqual([]);
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('with userid: parameterized WHERE clause', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([
        [{ assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg', kind: 'photo' }],
      ]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    await listImages(80001);

    const [sql, params] = fakeDb.execute.mock.calls[0];
    expect(sql).toMatch(/SELECT assetid, userid, localname, bucketkey, kind FROM assets WHERE userid = \? ORDER BY assetid ASC/);
    expect(params).toEqual([80001]);
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('mixed-kind round-trip: photo + document rows preserve kind', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([
        [
          { assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg', kind: 'photo' },
          { assetid: 1002, userid: 80001, localname: 'lecture.pdf', bucketkey: 'p_sarkar/uuid-lecture.pdf', kind: 'document' },
        ],
      ]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await listImages();

    expect(result).toHaveLength(2);
    expect(result[0].kind).toBe('photo');
    expect(result[1].kind).toBe('document');
  });

  test('closes DB connection even on failure', async () => {
    const fakeDb = {
      execute: jest.fn().mockRejectedValue(new Error('boom')),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    await expect(listImages()).rejects.toThrow('boom');
    expect(fakeDb.end).toHaveBeenCalled();
  });
});

describe('getImageLabels()', () => {
  test('unknown assetid throws "no such assetid"', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValueOnce([[]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    await expect(getImageLabels(99999)).rejects.toThrow('no such assetid');
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('known assetid with no labels returns []', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[{ assetid: 1001 }]])
        .mockResolvedValueOnce([[]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await getImageLabels(1001);

    expect(result).toEqual([]);
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('known assetid with labels returns mapped rows ordered by confidence DESC', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[{ assetid: 1001 }]])
        .mockResolvedValueOnce([[
          { label: 'Animal', confidence: 99 },
          { label: 'Dog', confidence: 90 },
        ]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await getImageLabels(1001);

    expect(result).toEqual([
      { label: 'Animal', confidence: 99 },
      { label: 'Dog', confidence: 90 },
    ]);
    const [labelsSql] = fakeDb.execute.mock.calls[1];
    expect(labelsSql).toMatch(/SELECT label, confidence FROM labels WHERE assetid = \? ORDER BY confidence DESC/);
    expect(fakeDb.end).toHaveBeenCalled();
  });
});

describe('uploadImage()', () => {
  beforeEach(() => {
    upload.cleanupTempFile.mockClear();
  });

  test('rejects unknown userid', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([[]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const fakeFile = { path: '/tmp/abc', originalname: 'x.jpg' };

    await expect(uploadImage(99999, fakeFile)).rejects.toThrow('no such userid');
    expect(upload.cleanupTempFile).toHaveBeenCalledWith('/tmp/abc');
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('round-trips through S3, Rekognition, and INSERT (photo path)', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[{ userid: 80001, username: 'p_sarkar' }]])    // user lookup
        .mockResolvedValueOnce([{ insertId: 1001 }])                            // assets INSERT
        .mockResolvedValueOnce([{ affectedRows: 2 }]),                          // labels INSERT
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const s3Send = jest.fn().mockResolvedValue({});
    aws.getBucket.mockReturnValue({ send: s3Send });
    aws.getBucketName.mockReturnValue('test-bucket');

    const rekogSend = jest.fn().mockResolvedValue({
      Labels: [
        { Name: 'Animal', Confidence: 99.5 },
        { Name: 'Dog', Confidence: 95.2 },
      ],
    });
    aws.getRekognition.mockReturnValue({ send: rekogSend });

    const fakeFile = { path: '/tmp/abc.jpg', originalname: '01degu.jpg' };
    const result = await uploadImage(80001, fakeFile);

    expect(result).toEqual({ assetid: 1001 });
    expect(s3Send).toHaveBeenCalledTimes(1);
    expect(rekogSend).toHaveBeenCalledTimes(1);
    // assets INSERT receives kind='photo' (derived from .jpg)
    expect(fakeDb.execute).toHaveBeenCalledWith(
      expect.stringMatching(/INSERT INTO assets/),
      expect.arrayContaining([80001, '01degu.jpg', expect.any(String), 'photo'])
    );
    // bucketkey shape: <username>/<uuid>-<localname>
    const assetsCall = fakeDb.execute.mock.calls.find(c => /INSERT INTO assets/.test(c[0]));
    const bucketkey = assetsCall[1][2];
    expect(bucketkey).toMatch(/^p_sarkar\/[0-9a-f-]+-01degu\.jpg$/);
    expect(upload.cleanupTempFile).toHaveBeenCalledWith('/tmp/abc.jpg');
  });

  test('stores a document without calling Rekognition (Q9)', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[{ userid: 80001, username: 'p_sarkar' }]])    // user lookup
        .mockResolvedValueOnce([{ insertId: 1042 }])                            // assets INSERT
        .mockResolvedValue([[]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    aws.getBucket.mockReturnValue({ send: jest.fn().mockResolvedValue({}) });
    aws.getBucketName.mockReturnValue('test-bucket');
    const rekogSend = jest.fn();
    aws.getRekognition.mockReturnValue({ send: rekogSend });

    const fakeFile = { path: '/tmp/abc', originalname: 'lecture-notes.pdf' };
    const result = await uploadImage(80001, fakeFile);

    expect(result).toEqual({ assetid: 1042 });
    expect(rekogSend).not.toHaveBeenCalled();
    expect(fakeDb.execute).toHaveBeenCalledWith(
      expect.stringMatching(/INSERT INTO assets/),
      expect.arrayContaining([80001, 'lecture-notes.pdf', expect.any(String), 'document'])
    );
    expect(fakeDb.execute).not.toHaveBeenCalledWith(
      expect.stringMatching(/INSERT IGNORE INTO labels/),
      expect.anything()
    );
    expect(upload.cleanupTempFile).toHaveBeenCalledWith('/tmp/abc');
  });
});

describe('downloadImage()', () => {
  test('unknown assetid throws "no such assetid"', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValueOnce([[]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    await expect(downloadImage(99999)).rejects.toThrow('no such assetid');
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('known assetid returns streamable shape with S3 ContentType when present', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValueOnce([[
        { assetid: 1001, userid: 80001, localname: '01degu.jpg', bucketkey: 'p_sarkar/uuid-01degu.jpg' },
      ]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    const fakeBody = { pipe: jest.fn() };
    const s3Result = { Body: fakeBody, ContentType: 'image/jpeg' };
    const s3Send = jest.fn().mockResolvedValue(s3Result);
    aws.getBucket.mockReturnValue({ send: s3Send });
    aws.getBucketName.mockReturnValue('test-bucket');

    const result = await downloadImage(1001);

    expect(result).toEqual({
      bucketkey: 'p_sarkar/uuid-01degu.jpg',
      localname: '01degu.jpg',
      contentType: 'image/jpeg',
      s3Result,
    });
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('content-type falls back to extension map when S3 has no ContentType', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValueOnce([[
        { assetid: 1042, userid: 80001, localname: 'lecture.pdf', bucketkey: 'p_sarkar/uuid-lecture.pdf' },
      ]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    const s3Result = { Body: { pipe: jest.fn() } }; // no ContentType
    aws.getBucket.mockReturnValue({ send: jest.fn().mockResolvedValue(s3Result) });
    aws.getBucketName.mockReturnValue('test-bucket');

    const result = await downloadImage(1042);

    expect(result.contentType).toBe('application/pdf');
    expect(result.localname).toBe('lecture.pdf');
  });

  test('content-type falls back to application/octet-stream for unknown extensions', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValueOnce([[
        { assetid: 1099, userid: 80001, localname: 'data.bin', bucketkey: 'p_sarkar/uuid-data.bin' },
      ]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    aws.getBucket.mockReturnValue({ send: jest.fn().mockResolvedValue({ Body: { pipe: jest.fn() } }) });
    aws.getBucketName.mockReturnValue('test-bucket');

    const result = await downloadImage(1099);

    expect(result.contentType).toBe('application/octet-stream');
  });
});

describe('deleteAll()', () => {
  test('empty DB: no S3 call, returns { deleted: true }', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[]])             // SELECT bucketkey: empty
        .mockResolvedValueOnce([{}])             // DELETE FROM labels
        .mockResolvedValueOnce([{}]),            // DELETE FROM assets
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    const s3Send = jest.fn();
    aws.getBucket.mockReturnValue({ send: s3Send });
    aws.getBucketName.mockReturnValue('test-bucket');

    const result = await deleteAll();

    expect(result).toEqual({ deleted: true });
    expect(s3Send).not.toHaveBeenCalled();
    expect(fakeDb.end).toHaveBeenCalled();
  });

  test('non-empty: DELETE FROM labels BEFORE DELETE FROM assets, S3 DeleteObjects AFTER both', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[
          { bucketkey: 'p_sarkar/uuid-a.jpg' },
          { bucketkey: 'p_sarkar/uuid-b.pdf' },
        ]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    const s3Send = jest.fn().mockResolvedValue({});
    aws.getBucket.mockReturnValue({ send: s3Send });
    aws.getBucketName.mockReturnValue('test-bucket');

    const result = await deleteAll();

    expect(result).toEqual({ deleted: true });

    // Order check: labels DELETE before assets DELETE before S3
    const sqls = fakeDb.execute.mock.calls.map(c => c[0]);
    const labelsIdx = sqls.findIndex(s => /DELETE FROM labels/.test(s));
    const assetsIdx = sqls.findIndex(s => /DELETE FROM assets/.test(s));
    expect(labelsIdx).toBeGreaterThan(-1);
    expect(assetsIdx).toBeGreaterThan(labelsIdx);

    // S3 DeleteObjects called with both bucketkeys
    expect(s3Send).toHaveBeenCalledTimes(1);
    const cmd = s3Send.mock.calls[0][0];
    expect(cmd.input.Delete.Objects).toEqual([
      { Key: 'p_sarkar/uuid-a.jpg' },
      { Key: 'p_sarkar/uuid-b.pdf' },
    ]);
  });

  test('DB delete failure short-circuits before S3 is touched', async () => {
    const fakeDb = {
      execute: jest.fn()
        .mockResolvedValueOnce([[{ bucketkey: 'p_sarkar/uuid-a.jpg' }]])
        .mockRejectedValueOnce(new Error('FK constraint')),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);
    const s3Send = jest.fn();
    aws.getBucket.mockReturnValue({ send: s3Send });
    aws.getBucketName.mockReturnValue('test-bucket');

    await expect(deleteAll()).rejects.toThrow('FK constraint');
    expect(s3Send).not.toHaveBeenCalled();
    expect(fakeDb.end).toHaveBeenCalled();
  });
});

describe('searchImages()', () => {
  test('empty string throws "label is required"', async () => {
    await expect(searchImages('')).rejects.toThrow('label is required');
  });

  test('whitespace-only throws "label is required"', async () => {
    await expect(searchImages('   ')).rejects.toThrow('label is required');
  });

  test('non-empty label returns mapped rows with case-insensitive LIKE', async () => {
    const fakeDb = {
      execute: jest.fn().mockResolvedValue([[
        { assetid: 1001, label: 'Animal', confidence: 99 },
        { assetid: 1002, label: 'Animal', confidence: 95 },
      ]]),
      end: jest.fn().mockResolvedValue(),
    };
    aws.getDbConn.mockResolvedValue(fakeDb);

    const result = await searchImages('animal');

    expect(result).toEqual([
      { assetid: 1001, label: 'Animal', confidence: 99 },
      { assetid: 1002, label: 'Animal', confidence: 95 },
    ]);
    const [sql, params] = fakeDb.execute.mock.calls[0];
    expect(sql).toMatch(/SELECT assetid, label, confidence FROM labels WHERE label LIKE \? ORDER BY assetid ASC, label ASC/);
    expect(params).toEqual(['%animal%']);
    expect(fakeDb.end).toHaveBeenCalled();
  });
});
