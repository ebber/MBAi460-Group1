import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  globalSetup: './e2e/fixtures/setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'default',
      testIgnore: ['**/destructive-*.spec.ts'],
    },
    {
      name: 'destructive',
      testMatch: ['**/destructive-*.spec.ts'],
    },
  ],
});
