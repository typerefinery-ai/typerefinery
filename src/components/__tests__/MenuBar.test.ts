import { describe, it, expect } from "vitest"
import router from "@/router"
import i18n from "@/i18n"
import Tooltip from "primevue/tooltip"
import PrimeVue from "primevue/config"
import { mount } from "@vue/test-utils"
import MenuBar from "@/components/Menu/MenuBar.vue"
describe("Content tabs tests", () => {
  const wrapper = mount(MenuBar, {
    global: {
      plugins: [router, i18n, PrimeVue],
      directives: { Tooltip },
    },
    props: { menuBarVisible: true },
  })
  const toggle = wrapper.get("#toggle-focus-button")
  const main = wrapper.get(".menu-bar")
  it("full screen on focus mode", async () => {
    await toggle.trigger("click")
    expect(main.attributes("class")).toContain("focus")
  })

  it("toggle focus", async () => {
    await toggle.trigger("click")
    expect(main.attributes("class")).not.toContain("focus")
  })
})
