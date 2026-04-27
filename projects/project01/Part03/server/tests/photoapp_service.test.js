jest.mock('../services/aws');
const aws = require('../services/aws');
const { getPing } = require('../services/photoapp');

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
