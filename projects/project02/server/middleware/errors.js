// Approach 01-foundation.md § Phase 5 Task 5.1
// Surface-specific AppError class hierarchy for Project 02.
// Status-code mapping lives in error_config.js (mount-prefix-aware DI config).

class AppError extends Error {
  constructor(message, { cause, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    if (cause !== undefined) this.cause = cause;
    if (details !== undefined) this.details = details;
  }
}

class BadRequestError extends AppError {} // 400 on /v1 and /v2
class NotFoundError extends AppError {} // 400 on /v1 (D7); 404 on /v2
class ConflictError extends AppError {} // 400 on /v1; 409 on /v2
class ServiceUnavailableError extends AppError {} // 503

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
};
