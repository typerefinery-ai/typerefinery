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
})
