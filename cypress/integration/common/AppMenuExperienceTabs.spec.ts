// https://docs.cypress.io/api/introduction/api.html

describe("Main Menu Tabs", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })

  it("Has Project tab in main menu.", () => {
    cy.get(".main-menu-wrapper")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-tabmenuitem")).to.contain("Project")
      })
  })
  it("Has Setting Button", () => {
    cy.get(".sidebar-fixed-items").eq(1).click()
    cy.contains("General").click()
    cy.get(".general-settings").contains("Experimental Features")
    cy.get(".p-inputswitch-slider").eq(0).click()
    cy.get(".p-inputswitch-slider").eq(1).click()
    cy.get(".p-inputswitch-slider").eq(2).click()
    cy.get(".p-inputswitch-slider").eq(3).click()
    cy.get(".p-dialog-header-close-icon").click()
  })
  it("Has Charts tab in main menu.", () => {
    cy.get(".main-menu-wrapper")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-tabmenuitem")).to.contain("Charts")
      })
  })

  it("Has Maps tab in main menu.", () => {
    cy.get(".main-menu-wrapper")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-tabmenuitem")).to.contain("Maps")
      })
  })
  it("Has Chat tab in main menu.", () => {
    cy.get(".main-menu-wrapper")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-tabmenuitem")).to.contain("Chat")
      })
  })
  it("Has Editor tab in main menu.", () => {
    cy.get(".main-menu-wrapper")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-tabmenuitem")).to.contain("Editor")
      })
  })
})
