//
// Phase 6 route unit tests for /api/*.
//
// Per the Phase 6+7 three-tier test factoring (03-api-routes-plan.md
// §Phase 6+7), this suite covers ONLY:
//   - Happy paths for each of the 8 routes (200 + success envelope).
//   - Inline-route-validation 400s — validation that lives IN the route
//     handler (non-int ids, missing file, missing/empty label).
//
// Service-thrown exception mapping (e.g. 'no such userid' -> 400,
// 'no such assetid' -> 404, generic Error -> 500) is the job of the
// Phase 7 error middleware and is verified by the Phase Q.2.0
// integration test, NOT here.
//
// `services/photoapp` is mocked. `middleware/upload` is NOT mocked: real
// multer parses supertest's multipart `.attach()` payloads end-to-end.
// Since the service is mocked, the multer-staged temp file is never
// read or cleaned up by the service — multer's own temp file is left
// in os.tmpdir()/photoapp-uploads (best-effort OS cleanup, same as in
// production with cleanupTempFile).
//

jest.mock('../services/photoapp');

const request = require('supertest');
const photoapp = require('../services/photoapp');
const app = require('../app');

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/ping
// ---------------------------------------------------------------------------
describe('GET /api/ping', () => {
  test('returns success envelope with counts', async () => {
    photoapp.getPing.mockResolvedValue({ s3_object_count: 2, user_count: 3 });

    const res = await request(app).get('/api/ping');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'success',
      data: { s3_object_count: 2, user_count: 3 },
    });
    expect(photoapp.getPing).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// GET /api/users
// ---------------------------------------------------------------------------
describe('GET /api/users', () => {
  test('returns success envelope with users array', async () => {
    photoapp.listUsers.mockResolvedValue([
      { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
    ]);

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].username).toBe('p_sarkar');
  });
});

// ---------------------------------------------------------------------------
// GET /api/images (with optional ?userid=)
// ---------------------------------------------------------------------------
describe('GET /api/images', () => {
  test('without userid: calls listImages(undefined) and returns envelope', async () => {
    photoapp.listImages.mockResolvedValue([
      { assetid: 1001, userid: 80001, localname: 'a.jpg', bucketkey: 'u/a.jpg', kind: 'photo' },
    ]);

    const res = await request(app).get('/api/images');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'success',
      data: [
        { assetid: 1001, userid: 80001, localname: 'a.jpg', bucketkey: 'u/a.jpg', kind: 'photo' },
      ],
    });
    expect(photoapp.listImages).toHaveBeenCalledWith(undefined);
  });

  test('with ?userid=80001: parses to int and calls listImages(80001)', async () => {
    photoapp.listImages.mockResolvedValue([]);

    const res = await request(app).get('/api/images?userid=80001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', data: [] });
    expect(photoapp.listImages).toHaveBeenCalledWith(80001);
  });

  test('non-int ?userid= returns 400 envelope', async () => {
    const res = await request(app).get('/api/images?userid=notanumber');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'invalid userid' });
    expect(photoapp.listImages).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// POST /api/images (multipart)
// ---------------------------------------------------------------------------
describe('POST /api/images', () => {
  test('accepts multipart upload and returns assetid envelope', async () => {
    photoapp.uploadImage.mockResolvedValue({ assetid: 1001 });

    const res = await request(app)
      .post('/api/images')
      .field('userid', '80001')
      .attach('file', Buffer.from('fakebytes'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', data: { assetid: 1001 } });
    expect(photoapp.uploadImage).toHaveBeenCalledWith(
      80001,
      expect.objectContaining({ originalname: 'test.jpg' })
    );
  });

  test('non-int userid returns 400 envelope', async () => {
    const res = await request(app)
      .post('/api/images')
      .field('userid', 'notanumber')
      .attach('file', Buffer.from('fakebytes'), 'test.jpg');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'invalid userid' });
    expect(photoapp.uploadImage).not.toHaveBeenCalled();
  });

  test('missing file returns 400 envelope', async () => {
    const res = await request(app)
      .post('/api/images')
      .field('userid', '80001');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'missing file' });
    expect(photoapp.uploadImage).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// GET /api/images/:assetid/file (streamed S3 body)
// ---------------------------------------------------------------------------
describe('GET /api/images/:assetid/file', () => {
  test('streams the S3 body with Content-Type from the service', async () => {
    // Build a Readable stream that emits fake bytes; the route does
    // s3Result.Body.pipe(res), so any object with .pipe(res) works.
    const { Readable } = require('stream');
    const body = Readable.from([Buffer.from('hello-bytes')]);

    photoapp.downloadImage.mockResolvedValue({
      contentType: 'image/jpeg',
      s3Result: { Body: body },
    });

    const res = await request(app).get('/api/images/1001/file');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\/jpeg/);
    expect(res.body).toEqual(Buffer.from('hello-bytes'));
    expect(photoapp.downloadImage).toHaveBeenCalledWith(1001);
  });

  test('non-int :assetid returns 400 envelope', async () => {
    const res = await request(app).get('/api/images/notanumber/file');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'invalid assetid' });
    expect(photoapp.downloadImage).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// GET /api/images/:assetid/labels
// ---------------------------------------------------------------------------
describe('GET /api/images/:assetid/labels', () => {
  test('returns labels envelope', async () => {
    photoapp.getImageLabels.mockResolvedValue([
      { label: 'Animal', confidence: 99 },
      { label: 'Dog', confidence: 90 },
    ]);

    const res = await request(app).get('/api/images/1001/labels');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'success',
      data: [
        { label: 'Animal', confidence: 99 },
        { label: 'Dog', confidence: 90 },
      ],
    });
    expect(photoapp.getImageLabels).toHaveBeenCalledWith(1001);
  });

  test('non-int :assetid returns 400 envelope', async () => {
    const res = await request(app).get('/api/images/notanumber/labels');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'invalid assetid' });
    expect(photoapp.getImageLabels).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// GET /api/search?label=...
// ---------------------------------------------------------------------------
describe('GET /api/search', () => {
  test('non-empty label returns search envelope', async () => {
    photoapp.searchImages.mockResolvedValue([
      { assetid: 1001, label: 'Animal', confidence: 99 },
    ]);

    const res = await request(app).get('/api/search?label=animal');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'success',
      data: [{ assetid: 1001, label: 'Animal', confidence: 99 }],
    });
    expect(photoapp.searchImages).toHaveBeenCalledWith('animal');
  });

  test('missing ?label= returns 400 envelope', async () => {
    const res = await request(app).get('/api/search');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: 'error',
      error: 'missing required query param: label',
    });
    expect(photoapp.searchImages).not.toHaveBeenCalled();
  });

  test('empty/whitespace ?label= returns 400 envelope', async () => {
    const res = await request(app).get('/api/search?label=%20%20');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: 'error',
      error: 'missing required query param: label',
    });
    expect(photoapp.searchImages).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/images
// ---------------------------------------------------------------------------
describe('DELETE /api/images', () => {
  test('returns success envelope with deleted: true', async () => {
    photoapp.deleteAll.mockResolvedValue({ deleted: true });

    const res = await request(app).delete('/api/images');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'success',
      data: { deleted: true },
    });
    expect(photoapp.deleteAll).toHaveBeenCalledTimes(1);
  });
});
