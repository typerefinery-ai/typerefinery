// check if login form is visible and click login button
Cypress.Commands.add("login", () => {
  cy.get(".login").should("be.visible").contains(".submit-button").click()
})
