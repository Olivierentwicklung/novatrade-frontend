import { defineConfig } from '@playwright/test';

import { basePlaywrightConfig } from './playwright.base.config';

export default defineConfig({
  ...basePlaywrightConfig,
  webServer: {
    command: 'npm run start:graphql-api',
    url: 'http://localhost:4200',
    reuseExistingServer: false,
  },
});
