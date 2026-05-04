// Approach 01-foundation.md § Phase 6 Task 6.1
// Zod-based validation middleware factory.
// Usage: validate({ body: schema, params: schema, query: schema })
// Parsed values land on req.validated.{body,params,query}.
// Invalid input → BadRequestError with flattened zod issues in err.details.
const { ZodError } = require('zod');
const { BadRequestError } = require('./errors');

function validate(schemas) {
  return (req, _res, next) => {
    try {
      req.validated = {
        body: schemas.body ? schemas.body.parse(req.body) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
      };
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new BadRequestError('validation failed', { details: err.flatten() }));
      }
      next(err);
    }
  };
}

module.exports = validate;
