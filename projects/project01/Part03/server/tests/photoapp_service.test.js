jest.mock('../services/aws');
const aws = require('../services/aws');
const { getPing, listUsers, listImages } = require('../services/photoapp');

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
