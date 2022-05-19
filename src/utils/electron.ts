export function isElectron(): boolean {
  // Renderer process
  if (
    typeof window !== "undefined" &&
    typeof window.process === "object" &&
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Process'
    window.process.type === "renderer"
  ) {
    return true
  }

  // Main process
  if (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    !!process.versions.electron
  ) {
    return true
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true
  }

  return false
}
