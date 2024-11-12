import { builtinModules } from "module"
import { defineConfig } from "vite"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../../package.json")


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
