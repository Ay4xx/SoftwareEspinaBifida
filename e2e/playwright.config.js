import 'dotenv/config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  reporter: [
    ['list'],
    ['html'],
    ['playwright-qase-reporter', {
      testops: {
        api: {
          token: process.env.QASE_API_TOKEN,
        },
        project: process.env.QASE_PROJECT_CODE,
        uploadAttachments: true,
        run: {
          complete: true,
        },
      },
    }],
  ],
});