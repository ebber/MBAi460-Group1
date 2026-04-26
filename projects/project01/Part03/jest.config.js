// Jest config for Project 01 Part 03 server tests.
// Server-side only (Node test environment); UI workstream uses Vitest.

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/server/tests/**/*.test.js'],
};
