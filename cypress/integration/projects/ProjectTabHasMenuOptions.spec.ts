// https://docs.cypress.io/api/introduction/api.html

describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })

  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })

  it("Has Sub Menu Buttons.", () => {
    cy.get(".p-menuitem-link[href='#/home/project']").click()
    cy.get(".main-submenu")
      .should("be.visible")
      .and(($tab) => {
        expect($tab.find(".main-submenu--item")).to.contain("New Project")
        expect($tab.find(".main-submenu--item")).to.contain("New Query")
        expect($tab.find(".main-submenu--item")).to.contain("New Connection")
        // expect($tab.find(".main-submenu--item")).to.contain("New Transformer")
      })
  })
})
