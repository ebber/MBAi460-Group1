// Approach 01-foundation.md § Phase 5 Task 5.2
// Table-driven test: (AppError subclass × mount prefix) → (HTTP status × envelope shape).
// Locks D7 (spec status codes on /v1) and the REST-correct deviations on /v2.
const { middleware } = require('@mbai460/photoapp-server');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
} = require('../../middleware/errors');
const { statusCodeMap, errorShapeFor } = require('../../middleware/error_config');

// Build a middleware function the same way app.js does.
const logger = { error: jest.fn(), warn: jest.fn() };
const errorMiddleware = middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger });

function makeReqRes(baseUrl = '/v1') {
  const req = { id: 'test-id', path: '/test', baseUrl };
  const body = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn((b) => {
      Object.assign(body, b);
      return res;
    }),
    locals: {},
    _body: body,
  };
  return { req, res };
}

const TABLE = [
  // err class            baseUrl  expectStatus  expectMessage
  [BadRequestError, '/v1', 400, 'error'],
  [BadRequestError, '/v2', 400, 'error'],
  [NotFoundError, '/v1', 400, 'error'], // D7: spec requires 400, not 404
  [NotFoundError, '/v2', 404, 'error'],
  [ConflictError, '/v1', 400, 'error'],
  [ConflictError, '/v2', 409, 'error'],
  [ServiceUnavailableError, '/v1', 503, 'error'],
  [ServiceUnavailableError, '/v2', 503, 'error'],
];

describe.each(TABLE)('%s on %s → HTTP %i', (Cls, baseUrl, expectedStatus, expectedMessageField) => {
  test('status + envelope shape', () => {
    const { req, res } = makeReqRes(baseUrl);
    const err = new Cls('test error');
    errorMiddleware(err, req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(expectedStatus);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('message', expectedMessageField);
    expect(body).toHaveProperty('error');
  });
});

test('multer LIMIT_FILE_SIZE → 400', () => {
  const { req, res } = makeReqRes('/v1');
  const err = Object.assign(new Error('file too large'), { code: 'LIMIT_FILE_SIZE' });
  errorMiddleware(err, req, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
});

test('unknown error → 500 with sanitised message', () => {
  const { req, res } = makeReqRes('/v1');
  errorMiddleware(new Error('db credentials exposed'), req, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(500);
  const body = res.json.mock.calls[0][0];
  expect(body.error).toBe('db credentials exposed');
});

test('req.errorShape is used when set (route-family DI)', () => {
  const { req, res } = makeReqRes('/v1');
  req.errorShape = { message: 'error', assetid: -1 };
  const err = new BadRequestError('no such assetid');
  errorMiddleware(err, req, res, jest.fn());
  const body = res.json.mock.calls[0][0];
  expect(body).toEqual({ message: 'error', assetid: -1 });
});
