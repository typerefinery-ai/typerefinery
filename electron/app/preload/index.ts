import { contextBridge, ipcRenderer } from "electron"
import { type AppIPC, sharedAppIpc } from "./ipc"

export interface AppEnvironment {
  platform: typeof process.platform
  frameless: boolean
}

const appEnvironment: AppEnvironment = {
  platform: process.platform,
  frameless: true,
}

declare global {
  const ipc: AppIPC
  const appEnvironment: AppEnvironment
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("api ipc DOMContentLoaded")
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ["chrome", "node", "electron"]) {
    const replaceWith: string = process.versions[dependency] || ""
    replaceText(`${dependency}-version`, replaceWith)
  }
})

console.log("api ipc")

contextBridge.exposeInMainWorld("api", {
  request: (channel: string, data: object) => {
    console.log("api request", channel, data)
    ipcRenderer.send(channel, data)
  },
  response: (channel: string, func: (data: object) => void) => {
    console.log("api response", channel, func)
    // Strip event as it includes `sender` and is a security risk
    ipcRenderer.on(channel, (event, data) => func(data))
    // ipcRenderer.on(channel, (data) => func(data))
  },
})

console.log([
  "ipc exposed",
  Object.fromEntries(
    Object.entries(sharedAppIpc).map(([channel, method]) => {
      return [channel, method.call.bind(method)]
    })
  ),
])

contextBridge.exposeInMainWorld(
  "ipc",
  Object.fromEntries(
    Object.entries(sharedAppIpc).map(([channel, method]) => {
      return [channel, method.call.bind(method)]
    })
  )
)

contextBridge.exposeInMainWorld("appEnvironment", appEnvironment)
