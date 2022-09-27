describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("Has popUp", () => {
    cy.get(".p-button-text").click()
  })
})
