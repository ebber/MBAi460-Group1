// Approach 01-foundation.md § Phase 5 Task 5.1
const {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
} = require('../../middleware/errors');

describe('AppError base class', () => {
  test('is an Error instance', () => {
    const e = new AppError('boom');
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(AppError);
    expect(e.message).toBe('boom');
    expect(e.name).toBe('AppError');
  });

  test('stores cause and details', () => {
    const cause = new Error('root cause');
    const e = new AppError('wrapped', { cause, details: { field: 'x' } });
    expect(e.cause).toBe(cause);
    expect(e.details).toEqual({ field: 'x' });
  });

  test('omits cause/details when not provided', () => {
    const e = new AppError('bare');
    expect(e.cause).toBeUndefined();
    expect(e.details).toBeUndefined();
  });
});

describe.each([
  ['BadRequestError', BadRequestError],
  ['NotFoundError', NotFoundError],
  ['ConflictError', ConflictError],
  ['ServiceUnavailableError', ServiceUnavailableError],
])('%s', (name, Cls) => {
  test(`is an AppError instance with name ${name}`, () => {
    const e = new Cls('msg');
    expect(e).toBeInstanceOf(AppError);
    expect(e).toBeInstanceOf(Cls);
    expect(e.name).toBe(name);
    expect(e.message).toBe('msg');
  });

  test('details round-trips', () => {
    const e = new Cls('msg', { details: { code: 42 } });
    expect(e.details).toEqual({ code: 42 });
  });
});
