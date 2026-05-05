// Integration tests for /v1 spec routes — happy path + key error envelopes.
//
// Mocks @mbai460/photoapp-server's services.photoapp.* so tests are
// hermetic (no real AWS / DB). Verifies the route adapters correctly:
//   1. Translate lib service responses to PDF-spec envelopes
//   2. Translate lib sentinel errors to PDF-spec error envelopes (400 + spec shape)
//   3. Validate input formats up-front (NaN userid/assetid → 400)
//
// Per-route ordering matches the mount order in app.js.

jest.mock('@mbai460/photoapp-server', () => {
  const actual = jest.requireActual('@mbai460/photoapp-server');
  return {
    ...actual,
    services: {
      ...actual.services,
      photoapp: {
        getPing: jest.fn(),
        listUsers: jest.fn(),
        listImages: jest.fn(),
        getImageLabels: jest.fn(),
        searchImages: jest.fn(),
        uploadImage: jest.fn(),
        downloadImage: jest.fn(),
        deleteAll: jest.fn(),
      },
    },
  };
});

const request = require('supertest');
const app = require('../../app');
const { services } = require('@mbai460/photoapp-server');
const photoapp = services.photoapp;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /ping
// ---------------------------------------------------------------------------

describe('GET /ping', () => {
  test('happy path: returns {message, M, N}', async () => {
    photoapp.getPing.mockResolvedValueOnce({ s3_object_count: 12, user_count: 3 });
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', M: 3, N: 12 });
  });
});

// ---------------------------------------------------------------------------
// GET /users
// ---------------------------------------------------------------------------

describe('GET /users', () => {
  test('happy path: returns {message, data}', async () => {
    const fakeUsers = [
      { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
    ];
    photoapp.listUsers.mockResolvedValueOnce(fakeUsers);
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', data: fakeUsers });
  });
});

// ---------------------------------------------------------------------------
// GET /images
// ---------------------------------------------------------------------------

describe('GET /images', () => {
  test('without userid: lists all assets', async () => {
    const fakeImages = [
      {
        assetid: 1001,
        userid: 80001,
        localname: 'a.jpg',
        bucketkey: 'p_sarkar/uuid-a.jpg',
        kind: 'photo',
      },
    ];
    photoapp.listImages.mockResolvedValueOnce(fakeImages);
    const res = await request(app).get('/images');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', data: fakeImages });
    expect(photoapp.listImages).toHaveBeenCalledWith(undefined);
  });

  test('with userid query: passes integer to lib', async () => {
    photoapp.listImages.mockResolvedValueOnce([]);
    const res = await request(app).get('/images?userid=80001');
    expect(res.status).toBe(200);
    expect(photoapp.listImages).toHaveBeenCalledWith(80001);
  });

  test('non-integer userid: 400 with spec shape {message, data:[]}', async () => {
    const res = await request(app).get('/images?userid=abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'userid must be an integer if provided', data: [] });
    expect(photoapp.listImages).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// POST /image/:userid
// ---------------------------------------------------------------------------

describe('POST /image/:userid', () => {
  const validBase64 = Buffer.from('fake image bytes').toString('base64');

  test('happy path: returns {message, assetid}', async () => {
    photoapp.uploadImage.mockResolvedValueOnce({ assetid: 1001 });
    const res = await request(app)
      .post('/image/80001')
      .send({ local_filename: 'test.jpg', data: validBase64 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', assetid: 1001 });
    expect(photoapp.uploadImage).toHaveBeenCalledTimes(1);
    const [userid, multerFile] = photoapp.uploadImage.mock.calls[0];
    expect(userid).toBe(80001);
    expect(multerFile.originalname).toBe('test.jpg');
    expect(typeof multerFile.path).toBe('string');
  });

  test('NaN userid: 400 with spec shape {message, assetid:-1}', async () => {
    const res = await request(app)
      .post('/image/abc')
      .send({ local_filename: 'test.jpg', data: validBase64 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'userid must be an integer', assetid: -1 });
    expect(photoapp.uploadImage).not.toHaveBeenCalled();
  });

  test('missing body fields: 400 with spec shape', async () => {
    const res = await request(app).post('/image/80001').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: 'missing required body fields: local_filename, data',
      assetid: -1,
    });
    expect(photoapp.uploadImage).not.toHaveBeenCalled();
  });

  test('lib throws "no such userid": 400 with spec shape', async () => {
    photoapp.uploadImage.mockRejectedValueOnce(new Error('no such userid'));
    const res = await request(app)
      .post('/image/99999')
      .send({ local_filename: 'test.jpg', data: validBase64 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'no such userid', assetid: -1 });
  });
});

// ---------------------------------------------------------------------------
// GET /image/:assetid
// ---------------------------------------------------------------------------

describe('GET /image/:assetid', () => {
  test('happy path: returns {message, userid, local_filename, data:base64}', async () => {
    const imageBytes = Buffer.from('fake image bytes');
    const s3Body = {
      [Symbol.asyncIterator]: async function* () {
        yield imageBytes;
      },
    };
    photoapp.downloadImage.mockResolvedValueOnce({
      userid: 80001,
      bucketkey: 'p_sarkar/uuid-a.jpg',
      localname: 'a.jpg',
      contentType: 'image/jpeg',
      s3Result: { Body: s3Body },
    });
    const res = await request(app).get('/image/1001');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'success',
      userid: 80001,
      local_filename: 'a.jpg',
      data: imageBytes.toString('base64'),
    });
  });

  test('NaN assetid: 400 with spec shape {message, userid:-1}', async () => {
    const res = await request(app).get('/image/abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'assetid must be an integer', userid: -1 });
    expect(photoapp.downloadImage).not.toHaveBeenCalled();
  });

  test('lib throws "no such assetid": 400 with spec shape', async () => {
    photoapp.downloadImage.mockRejectedValueOnce(new Error('no such assetid'));
    const res = await request(app).get('/image/99999');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'no such assetid', userid: -1 });
  });
});

// ---------------------------------------------------------------------------
// GET /image_labels/:assetid
// ---------------------------------------------------------------------------

describe('GET /image_labels/:assetid', () => {
  test('happy path: returns {message, data}', async () => {
    const fakeLabels = [
      { label: 'Animal', confidence: 99 },
      { label: 'Dog', confidence: 90 },
    ];
    photoapp.getImageLabels.mockResolvedValueOnce(fakeLabels);
    const res = await request(app).get('/image_labels/1001');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', data: fakeLabels });
  });

  test('NaN assetid: 400 with spec shape {message, data:[]}', async () => {
    const res = await request(app).get('/image_labels/abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'assetid must be an integer', data: [] });
  });

  test('lib throws "no such assetid": 400 with spec shape', async () => {
    photoapp.getImageLabels.mockRejectedValueOnce(new Error('no such assetid'));
    const res = await request(app).get('/image_labels/99999');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'no such assetid', data: [] });
  });
});

// ---------------------------------------------------------------------------
// GET /images_with_label/:label
// ---------------------------------------------------------------------------

describe('GET /images_with_label/:label', () => {
  test('happy path: returns {message, data}', async () => {
    const fakeMatches = [{ assetid: 1001, label: 'Dog', confidence: 99 }];
    photoapp.searchImages.mockResolvedValueOnce(fakeMatches);
    const res = await request(app).get('/images_with_label/dog');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', data: fakeMatches });
    expect(photoapp.searchImages).toHaveBeenCalledWith('dog');
  });
});

// ---------------------------------------------------------------------------
// DELETE /images
// ---------------------------------------------------------------------------

describe('DELETE /images', () => {
  test('happy path: returns {message}', async () => {
    photoapp.deleteAll.mockResolvedValueOnce({ deleted: true });
    const res = await request(app).delete('/images');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success' });
    expect(photoapp.deleteAll).toHaveBeenCalledTimes(1);
  });
});
