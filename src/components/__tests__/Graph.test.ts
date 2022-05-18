import { describe, it, expect } from "vitest"
import router from "@/router"
import i18n from "@/i18n"
import Tooltip from "primevue/tooltip"
import PrimeVue from "primevue/config"
import { mount } from "@vue/test-utils"
import ContentTab from "@/components/Project/ContentTab"
describe("It renders Graphs", () => {
  const wrapper = mount(ContentTab, {
    global: {
      plugins: [router, i18n, PrimeVue],
      directives: { Tooltip },
    },
    props: { toolsVisible: true, focus: false, tabId: "tab1", paneId: "pane1" },
    data() {
      return { activeView: "G" }
    },
  })

  const SVG = wrapper.get("#graph")

  it("renders d3 graph", async () => {
    const Button = wrapper.get(".p-button.p-component.p-button-raised.m-3")
    await Button.trigger("click")
    expect(SVG.attributes("class")).toContain("d3-graph")
  })

  it("renders webcola graph", async () => {
    const Button = wrapper.get(
      ".p-button.p-component.p-button-raised.m-3.p-button-success"
    )
    await Button.trigger("click")
    expect(SVG.attributes("class")).toContain("webcola-graph")
  })

  it("renders d3-labels graph", async () => {
    const Button = wrapper.get(
      ".p-button.p-component.p-button-raised.m-3.p-button-warning"
    )
    await Button.trigger("click")
    expect(SVG.attributes("class")).toContain("d3-label-graph")
  })
})
