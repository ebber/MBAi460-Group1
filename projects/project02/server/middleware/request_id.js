// Approach 01-foundation.md § Phase 3 Task 3.2.
// Reads X-Request-Id from the inbound request if present; otherwise generates
// a v4 UUID. Sets req.id and echoes the header on the response so a downstream
// caller can correlate. Pino-http (Task 3.3) reads req.id via genReqId so
// every per-request log line carries the same id; CloudWatch / log aggregation
// can then trace a single request across the entire stack.
const { v4: uuidv4 } = require('uuid');

const HEADER = 'X-Request-Id';

function requestId(req, res, next) {
  const incoming = req.headers[HEADER.toLowerCase()];
  const id = incoming || uuidv4();
  req.id = id;
  res.setHeader(HEADER, id);
  next();
}

module.exports = requestId;
