// frontend/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    viewportWidth: 1366,
    viewportHeight: 768,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // registra o plugin do reporter
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Relatório E2E',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
});
