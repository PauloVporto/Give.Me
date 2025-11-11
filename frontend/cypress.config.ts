import { defineConfig } from 'cypress';
import { devServer } from '@cypress/vite-dev-server';

export default defineConfig({
  projectId: 'uynhjj',
  e2e: {
    baseUrl: 'http://localhost:3000', // ajuste para sua app (ex.: 5173/8000)
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    viewportWidth: 1366,
    viewportHeight: 768,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // plugins / events
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {},
    },
    specPattern: 'cypress/component/**/*.cy.{js,ts,jsx,tsx}',
  },
  reporter: 'spec',
});
