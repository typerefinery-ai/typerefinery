// https://docs.cypress.io/api/introduction/api.html

describe("App Menu Items", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })

  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })

  it("Has Github link in Help menu.", () => {
    cy.get("#help-button").click()
    cy.get(".p-menu")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-menuitem-link")).to.contain("Github")
      })
    cy.get("#help-button").click()
  })

  it("Has English in Change Language menu.", () => {
    cy.get("#change-language-button").click()
    cy.get(".p-menu")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-menuitem-link")).to.contain("English")
      })
    cy.get("#change-language-button").click()
  })

  it("Has Hindi in Change Language menu.", () => {
    cy.get("#change-language-button").click()
    cy.get(".p-menu")
      .should("be.visible")
      .and(($menu) => {
        expect($menu.find(".p-menuitem-link")).to.contain("हिन्दी")
      })
    cy.get("#change-language-button").click()
  })

  it("Has Toggle Theme button.", () => {
    expect(cy.get("#toggle-theme-button"))
  })
  it("Has Toggle Focus button.", () => {
    expect(cy.get("#toggle-focus-button"))
  })
  it("Has Profile button.", () => {
    cy.get("#profile-button").click()
    cy.get(".p-dialog-header-close-icon").click()
  })
})
