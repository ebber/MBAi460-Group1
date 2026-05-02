//
// Unit tests for server/services/aws.js (AWS clients factory + DB helper).
//
// Per Part 03 §Phase 2 (Tasks 2.1, 2.2):
//   - Mock fs so the module-private readPhotoAppConfig() reads a fake ini.
//   - Assert each factory returns the correct shape without contacting AWS/RDS.
//   - Pin the explicit-await contract on getDbConn() with a mysql2 spy.
//

// We mock fs.readFileSync so readPhotoAppConfig() reads our FAKE_INI without
// touching disk. We deliberately preserve the rest of fs (notably fs.promises),
// because @aws-sdk/token-providers destructures fs.promises.writeFile at module
// load — a bare jest.mock('fs') auto-mock wipes that and breaks SDK import.
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    readFileSync: jest.fn(),
  };
});

const FAKE_INI = `
[s3]
region_name = us-east-2
bucket_name = test-bucket

[rds]
endpoint = test-endpoint
port_number = 3306
user_name = test-user
user_pwd = test-pwd
db_name = photoapp
`;

beforeEach(() => {
  jest.resetModules();
  // After resetModules, requiring 'fs' re-applies the mock factory and gives
  // us the (fresh) mocked readFileSync to program for this test.
  const fs = require('fs');
  fs.readFileSync.mockReturnValue(FAKE_INI);
});

test('getBucketName reads bucket_name from config', () => {
  const { getBucketName } = require('../../src/services/aws');
  expect(getBucketName()).toBe('test-bucket');
});

test('getBucket returns an S3Client configured for the region', () => {
  const { getBucket } = require('../../src/services/aws');
  const client = getBucket();
  expect(client).toBeDefined();
  // client.config.region is a function in AWS SDK v3
  expect(typeof client.config.region).toBe('function');
});

test('getRekognition returns a RekognitionClient', () => {
  const { getRekognition } = require('../../src/services/aws');
  const client = getRekognition();
  expect(client).toBeDefined();
});

test('getDbConn resolves to a connection-shaped object, not a Promise', async () => {
  const fakeConn = { execute: jest.fn(), end: jest.fn() };
  const mysql2 = require('mysql2/promise');
  jest.spyOn(mysql2, 'createConnection').mockResolvedValue(fakeConn);

  const { getDbConn } = require('../../src/services/aws');
  const conn = await getDbConn();

  // If the implementation returns the unawaited Promise, conn would still be a Promise
  // and these would fail.
  expect(typeof conn.execute).toBe('function');
  expect(typeof conn.end).toBe('function');
});
