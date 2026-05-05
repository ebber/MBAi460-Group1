// Approach 01-foundation.md § Phase 7 Task 7.2
// opossum circuit breakers wrapping the library's S3 and Rekognition clients.
// One breaker per service, memoised per process.
// State changes are logged at warn so CloudWatch / pino captures transitions.
// Promotion candidate for library 1.1.0.
const CircuitBreaker = require('opossum');
const { services } = require('@mbai460/photoapp-server');
const logger = require('../observability/pino');

const BREAKER_OPTS = {
  timeout: 10_000,
  errorThresholdPercentage: 50,
  resetTimeout: 30_000,
};

function makeBreaker(name, fn) {
  const breaker = new CircuitBreaker(fn, BREAKER_OPTS);
  breaker.on('open', () => logger.warn({ breaker: name }, 'circuit breaker opened'));
  breaker.on('halfOpen', () => logger.warn({ breaker: name }, 'circuit breaker half-open'));
  breaker.on('close', () => logger.warn({ breaker: name }, 'circuit breaker closed'));
  return breaker;
}

let bucketBreaker = null;
let rekognitionBreaker = null;

function getBucketBreaker() {
  if (!bucketBreaker) {
    bucketBreaker = makeBreaker('s3', (cmd) => services.aws.getBucket().send(cmd));
  }
  return bucketBreaker;
}

function getRekognitionBreaker() {
  if (!rekognitionBreaker) {
    rekognitionBreaker = makeBreaker('rekognition', (cmd) =>
      services.aws.getRekognition().send(cmd),
    );
  }
  return rekognitionBreaker;
}

module.exports = { getBucketBreaker, getRekognitionBreaker };
