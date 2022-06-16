import { build } from "vite"

await build({ configFile: "electron/app/main/vite.config.ts" })
await build({ configFile: "electron/app/preload/vite.config.ts" })
// await build({ configFile: "packages/renderer/vite.config.ts" })
