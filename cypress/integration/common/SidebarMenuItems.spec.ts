describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })
  it("Has Setting Button", () => {
    cy.get(".sidebar-fixed-items").eq(2).click()
    cy.contains("General").click()
    cy.contains("Profile").click()
    cy.get(".user_info-name").contains("TypeRefinery User")
    cy.contains("Privacy").click()
    cy.contains("Services").click()
    cy.get(".p-dialog-header-icon").click()
  })
  it("Has Logout Button", () => {
    cy.get(".sidebar-fixed-items").eq(3).click()
  })
})
