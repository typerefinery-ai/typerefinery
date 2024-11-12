import { join } from "path"
import { builtinModules } from "module"
import { defineConfig } from "vite"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../../package.json")

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "../../../dist/preload",
    emptyOutDir: true,
    minify: false,
    // minify: process.env./* from mode option */ NODE_ENV === "production",
    // https://github.com/caoxiemeihao/electron-vue-vite/issues/61
    sourcemap: "inline",
    rollupOptions: {
      input: {
        // multiple entry
        index: join(__dirname, "index.ts"),
      },
      output: {
        format: "cjs",
        entryFileNames: "[name].cjs",
        manualChunks: {},
      },
      external: [
        "electron",
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },
})
