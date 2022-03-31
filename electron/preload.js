const { contextBridge, ipcRenderer } = require("electron")

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

contextBridge.exposeInMainWorld("api", {
  request: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  response: (channel, func) => {
    // Strip event as it includes `sender` and is a security risk
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
})
