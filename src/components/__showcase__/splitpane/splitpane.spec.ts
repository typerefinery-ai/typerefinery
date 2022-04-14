import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import SplitPane from "@/components/__showcase__/splitpane/SplitPane.showcase.vue"

describe("Testing Splitpanes", () => {
  const wrapper = mount(SplitPane)
  const pane = wrapper.get(".splitpanes__pane")
  const splitter = wrapper.get(".splitpanes__splitter")

  it("minimizes the pane on clicking", async () => {
    await splitter.trigger("click")
    expect(pane.attributes("class")).toContain("minimized")
  })

  it("go back to it's original position on clicking again", async () => {
    await splitter.trigger("click")
    expect(pane.attributes("class")).not.toContain("minimized")
  })
})
