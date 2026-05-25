// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html'],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: true,
        testops: {
          api: {
            token: '3cbc592bde470d5ced77f240d031f1a81ab57ef9335bc15a5806174bdf3b6030',
          },
          project: 'HS01',
          run: {
            complete: true,
          },
        },
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: false,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});