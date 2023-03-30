describe("Project Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  // it("Has popUp", () => {
  //   cy.get(".p-button-text").click()
  // })

  // Hide the bar
  it("Has hide menu button", () => {
    cy.get(".main-submenu > .icon-wrapper > .pi").click()
  })
  // it("Has Show Menubar button", () => {
  //   cy.get("#show-menu-bar-button").click()
  // })
})
