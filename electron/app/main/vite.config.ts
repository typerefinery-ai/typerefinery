import { builtinModules } from "module"
import { defineConfig } from "vite"

import path from "path"
import fs from "fs"
// load json package file from '../../../package.json'
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../../package.json"), "utf8")
)

export default defineConfig({
  root: __dirname,
  publicDir: "../../static",
  build: {
    outDir: "../../../dist/main",
    emptyOutDir: true,
    minify: false,
    // minify: process.env./* from mode option */ NODE_ENV === "production",
    sourcemap: true,
    lib: {
      entry: "index.ts",
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    rollupOptions: {
      external: [
        /^node:.*/,
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
        "electron",
      ],
    },
  },
})
