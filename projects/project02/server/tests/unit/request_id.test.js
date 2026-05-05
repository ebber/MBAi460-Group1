// Approach 01-foundation.md § Phase 3 Task 3.2.
const requestId = require('../../middleware/request_id');

function fakeReqRes(headers = {}) {
  const responseHeaders = {};
  return {
    req: { headers },
    res: {
      setHeader(name, value) {
        responseHeaders[name] = value;
      },
      getHeader(name) {
        return responseHeaders[name];
      },
    },
  };
}

test('uses incoming X-Request-Id when present', (done) => {
  const { req, res } = fakeReqRes({ 'x-request-id': 'abc-123' });
  requestId(req, res, () => {
    expect(req.id).toBe('abc-123');
    expect(res.getHeader('X-Request-Id')).toBe('abc-123');
    done();
  });
});

test('generates a uuid when X-Request-Id is absent', (done) => {
  const { req, res } = fakeReqRes({});
  requestId(req, res, () => {
    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(res.getHeader('X-Request-Id')).toBe(req.id);
    done();
  });
});
