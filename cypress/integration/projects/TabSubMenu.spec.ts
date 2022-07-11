describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })
})
