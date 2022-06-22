describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })
  it("Has Query button", () => {
    cy.get(".p-button-label").contains("Query").click()
  })
  it("Has Data button", () => {
    cy.get(".p-button-label").contains("Data").click()
  })
  it("Has Transform button", () => {
    cy.get(".p-button-label").contains("Transform").click()
  })
  it("Has Graph button", () => {
    cy.get(".p-button-label").contains("Graph").click()
  })
})
