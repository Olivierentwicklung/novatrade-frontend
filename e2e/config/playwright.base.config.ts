import { defineConfig } from '@playwright/test';

export const basePlaywrightConfig = defineConfig({
  testDir: '../features',
  use: {
    baseURL: 'http://localhost:4200',
  },
});
