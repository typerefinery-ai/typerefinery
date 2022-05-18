// https://docs.cypress.io/api/introduction/api.html

describe("Functionl test", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })

  it("User profile functional test", () => {
    cy.get(".menu-item").eq(2).click()
    expect(cy.get(".p-dialog-title").contains("उपयोगकर्ता रूपरेखा"))
    expect(cy.get(".p-dialog-header-close-icon"))
  })
})