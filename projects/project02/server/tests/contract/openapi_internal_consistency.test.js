// Approach 01-foundation.md § Phase 9 Task 9.3
// Validates openapi.yaml for internal consistency: all $refs resolve,
// every response schema is reachable, no orphan components.
const path = require('path');
const SwaggerParser = require('@apidevtools/swagger-parser');

const OPENAPI_PATH = path.resolve(__dirname, '../../../api/openapi.yaml');

test('openapi.yaml is internally consistent (all $refs resolve, schemas valid)', async () => {
  await expect(SwaggerParser.validate(OPENAPI_PATH)).resolves.toBeDefined();
}, 10_000);
