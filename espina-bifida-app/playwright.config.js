// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/automaticasTest2',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: true,
        testops: {
          api: {
            token: '80c02962b7c8f454476d4e8a78c19b9ec94f5cefddadce007e388df6878b4e5e',
          },
          project: 'HS01',
          run: {
            title: 'Regression Sprint 3',
            complete: true,
          },
        },
      },
    ],
  ],

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});