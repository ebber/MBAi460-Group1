// Approach 01-foundation.md § Phase 6 Task 6.1
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { BadRequestError } = require('../../middleware/errors');

function makeReq(overrides = {}) {
  return { body: {}, params: {}, query: {}, ...overrides };
}

test('valid body parses to req.validated.body', () => {
  const schema = z.object({ name: z.string() });
  const mw = validate({ body: schema });
  const req = makeReq({ body: { name: 'alice' } });
  const next = jest.fn();
  mw(req, {}, next);
  expect(next).toHaveBeenCalledWith();
  expect(req.validated.body).toEqual({ name: 'alice' });
});

test('invalid body calls next with BadRequestError containing flattened details', () => {
  const schema = z.object({ name: z.string() });
  const mw = validate({ body: schema });
  const req = makeReq({ body: { name: 42 } });
  const next = jest.fn();
  mw(req, {}, next);
  const err = next.mock.calls[0][0];
  expect(err).toBeInstanceOf(BadRequestError);
  expect(err.message).toBe('validation failed');
  expect(err.details).toBeDefined();
  expect(err.details.fieldErrors).toHaveProperty('name');
});

test('missing schema section is a no-op (req.validated.body is undefined)', () => {
  const mw = validate({});
  const req = makeReq({ body: { anything: true } });
  const next = jest.fn();
  mw(req, {}, next);
  expect(next).toHaveBeenCalledWith();
  expect(req.validated.body).toBeUndefined();
  expect(req.validated.params).toBeUndefined();
  expect(req.validated.query).toBeUndefined();
});

test('valid params parse to req.validated.params', () => {
  const schema = z.object({ userid: z.string().min(1) });
  const mw = validate({ params: schema });
  const req = makeReq({ params: { userid: '80001' } });
  const next = jest.fn();
  mw(req, {}, next);
  expect(next).toHaveBeenCalledWith();
  expect(req.validated.params).toEqual({ userid: '80001' });
});

test('valid query parses to req.validated.query', () => {
  const schema = z.object({ limit: z.coerce.number().optional() });
  const mw = validate({ query: schema });
  const req = makeReq({ query: { limit: '10' } });
  const next = jest.fn();
  mw(req, {}, next);
  expect(req.validated.query).toEqual({ limit: 10 });
});
