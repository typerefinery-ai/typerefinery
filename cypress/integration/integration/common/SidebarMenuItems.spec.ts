describe("Project Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/").reload();
  })
  // it("Has popUp", () => {
  //   cy.get(".p-button-text").click()
  // })
  it("Has Setting Button", () => {;
    cy.get(".sidebar-fixed-items").eq(1).click()
    cy.contains("General").click()
    cy.contains("Profile").click()
    // Not Required.
    // cy.get(".user_info-name").contains("TypeRefinery User")
    cy.contains("Privacy").click()
    cy.contains("Services").click()
    cy.get(".p-dialog-header-icon").click()
  })
})
