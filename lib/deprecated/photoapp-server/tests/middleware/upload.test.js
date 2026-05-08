// Phase 4: multer multipart upload middleware + cleanupTempFile helper.
// Per DesignDecisions Q9 (Part 03), this layer accepts ALL file types;
// the only filter is the 50 MB size limit. Document OCR via Textract is
// Future-State, so PDFs/docs flow through here unaltered.

const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
const request = require('supertest');
const { createUploadMiddleware, cleanupTempFile } = require('../../src/middleware/upload');

// Construct the default-configured upload middleware (Part 03 defaults: 50 MB,
// os.tmpdir/photoapp-uploads). Factory pattern is the post-extraction shape;
// defaults reproduce Part 03's exact pre-extraction behaviour.
const upload = createUploadMiddleware();

// --- Task 4.1: multer accepts photos + documents, rejects > 50 MB ---

test('upload middleware accepts a JPEG (photo)', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) =>
    res.json({ ok: true, mime: req.file.mimetype })
  );

  const res = await request(app)
    .post('/test-upload')
    .attach('file', Buffer.from('fake'), {
      filename: 'a.jpg',
      contentType: 'image/jpeg',
    });
  expect(res.status).toBe(200);
  expect(res.body.mime).toBe('image/jpeg');
});

test('upload middleware accepts a PDF (document)', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) =>
    res.json({ ok: true, mime: req.file.mimetype })
  );

  const res = await request(app)
    .post('/test-upload')
    .attach('file', Buffer.from('fake'), {
      filename: 'b.pdf',
      contentType: 'application/pdf',
    });
  expect(res.status).toBe(200);
  expect(res.body.mime).toBe('application/pdf');
});

test('upload middleware rejects files over 50 MB', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) =>
    res.sendStatus(200)
  );
  app.use((err, req, res, next) => res.status(400).json({ error: err.code }));

  const big = Buffer.alloc(51 * 1024 * 1024);
  const res = await request(app)
    .post('/test-upload')
    .attach('file', big, {
      filename: 'huge.bin',
      contentType: 'application/octet-stream',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('LIMIT_FILE_SIZE');
});

// --- Task 4.2: cleanupTempFile helper ---

test('cleanupTempFile removes an existing file', () => {
  const p = path.join(os.tmpdir(), 'photoapp-test-cleanup.bin');
  fs.writeFileSync(p, 'x');
  cleanupTempFile(p);
  expect(fs.existsSync(p)).toBe(false);
});

test('cleanupTempFile is a no-op when the file is missing', () => {
  expect(() =>
    cleanupTempFile(path.join(os.tmpdir(), 'definitely-not-here.bin'))
  ).not.toThrow();
});
