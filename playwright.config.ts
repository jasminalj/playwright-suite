import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir:       './tests',
  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 4 : 2,

  reporter: [
    ['html',  { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile:   'reports/junit/results.xml'   }],
    ['list'],
  ],

  use: {
    baseURL:           process.env.BASE_URL ?? 'http://localhost:4000',
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'on-first-retry',
    actionTimeout:     10_000,
    navigationTimeout: 30_000,
  },

  webServer: process.env.BASE_URL ? undefined : {
    command:             'npx serve app -p 4000 --no-clipboard',
    port:                4000,
    reuseExistingServer: !process.env.CI,
    stdout:              'ignore',
    stderr:              'pipe',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
