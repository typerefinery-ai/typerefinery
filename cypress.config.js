const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    reporter: "cypress-multi-reporters",
    reporterOptions: {
      configFile: "reporter-config.json",
    },
    supportFile: "cypress/support/index.ts",
    specPattern: "cypress/integration/**/*.spec.ts",
  },
})
