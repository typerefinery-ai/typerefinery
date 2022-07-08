describe("Projecty Tab", () => {
  it("visits the app root url", () => {
    cy.visit("/")
  })
  it("login as default user", () => {
    cy.get(".login").should("be.visible").find(".submit-button").click()
  })
  it("Has Projects Tree", () => {
    cy.get(".p-tree-toggler-icon").eq(0).click()
    cy.get(".p-tree-toggler-icon").eq(1).click()
  })
  it("Has Query Button", () => {
    cy.get(".p-tree-toggler-icon").eq(2).click()
    cy.get(`[data-v-6ac6996e]`).contains("query 1").dblclick()
  })
  it("Has Algorithm Tab", () => {
    cy.get(".p-button-label").contains("Algorithm").click()
  })
  it("Has Data Tab", () => {
    cy.get(".p-button-label").contains("Data").click()
  })
  it("Has Tramsform Tab", () => {
    cy.get(".p-button-label").contains("Transform").click()
  })
  it("Has Graph Tab", () => {
    cy.get(".p-button-label").contains("Graph").click()
    cy.get(`[data-v-6ac6996e]`).contains("query 1").dblclick()
    cy.get(".p-tree-toggler-icon").eq(2).click()
  })

  it("Has LocalConnection Button", () => {
    cy.get(".p-tree-toggler-icon").eq(3).click()
    cy.get(`[data-v-6ac6996e]`).contains("connection 1").dblclick()
    cy.get(".p-dialog-title").contains("Update Connection")
    cy.get(".p-button-label").contains("Cancel").click()
    cy.get(".p-tree-toggler-icon").eq(3).click()
  })
  it("Has LocalTransformer Button", () => {
    cy.get(".p-tree-toggler-icon").eq(4).click()
    cy.get(`[data-v-6ac6996e]`).contains("transformer 1").dblclick()
    cy.get(".p-dialog-title").contains("Update Transformer")
    cy.get(".p-button-label").contains("Cancel").click()
    cy.get(".p-tree-toggler-icon").eq(4).click()
  })
  it("Has LocalAlgorithm Button", () => {
    cy.get(".p-tree-toggler-icon").eq(5).click()
    cy.get(`[data-v-6ac6996e]`).contains("algorithm 1").dblclick()
    cy.get(".p-dialog-title").contains("Update Algorithm")
    cy.get(".p-button-label").contains("Cancel").click()
    cy.get(".p-tree-toggler-icon").eq(5).click()
    cy.get(".p-tree-toggler-icon").eq(1).click()
    cy.get(".p-tree-toggler-icon").eq(0).click()
  })
})
