import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'uynhjj',
  e2e: {
    baseUrl: 'https://give-me.vercel.app/login', 
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
