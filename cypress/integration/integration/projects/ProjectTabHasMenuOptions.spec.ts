// https://docs.cypress.io/api/introduction/api.html

describe("Project Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/").reload();
  })
  // it("Has popUp", () => {
  //   cy.get(".p-button-text").click()
  // })

  it("Has Sub Menu Buttons.", () => {
    // New Buttons
    cy.get(".p-menuitem-link[href='#/home/project']").click()
    cy.get(".main-submenu")
      .should("be.visible")
      .and(($tab) => {
        expect($tab.find(".main-submenu--item")).to.contain("New Project")
        expect($tab.find(".main-submenu--item")).to.contain("New Query")
        expect($tab.find(".main-submenu--item")).to.contain("New Connection")
        expect($tab.find(".main-submenu--item")).to.contain("New Theme")
      })
  })
})
