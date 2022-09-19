describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("Has Setting Button", () => {
    cy.get(".sidebar-fixed-items").eq(1).click()
    cy.contains("General").click()
    cy.contains("Profile").click()
    cy.get(".user_info-name").contains("TypeRefinery User")
    cy.contains("Privacy").click()
    cy.contains("Services").click()
    cy.get(".p-dialog-header-icon").click()
  })
})
