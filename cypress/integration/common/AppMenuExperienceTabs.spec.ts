// https://docs.cypress.io/api/introduction/api.html

describe("Main Menu Tabs", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })

  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
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