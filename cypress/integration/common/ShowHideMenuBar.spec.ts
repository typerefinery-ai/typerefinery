describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })
  it("Has hide menu button", () => {
    cy.get(".main-submenu > .icon-wrapper > .pi").click()
  })
  it("Has Show Menubar button", () => {
    cy.get("#show-menu-bar-button").click()
  })
})
