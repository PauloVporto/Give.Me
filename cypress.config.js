// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // REMOVA esta linha ou corrija para:
    baseUrl: 'https://give-me.vercel.app',
    // OU comente para desativar:
    // baseUrl: null,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});