describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("Has hide menu button", () => {
    cy.get(".main-submenu > .icon-wrapper > .pi").click()
  })
  it("Has Show Menubar button", () => {
    cy.get("#show-menu-bar-button").click()
  })
})
