/// <reference types="vitest" />

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { plugin as markdown } from "vite-plugin-markdown"

import { fileURLToPath, URL } from "url"

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.ELECTRON == "true" ? "./" : "",
  plugins: [
    markdown(),
    {
      name: "vitest-plugin-beforeall",
      config: () => ({
        test: { setupFiles: ["./vitest/beforeall.ts"] },
      }),
    },
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [
      ".js",
      ".json",
      ".jsx",
      ".mjs",
      ".ts",
      ".tsx",
      ".vue",
      ".css",
      ".scss",
    ],
  },
  test: {
    globals: true,
    globalSetup: ["./vitest/setup.ts"],
    environment: "jsdom",
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
  build: {
    watch: {
      exclude: ["node_modules/**", "dist/**", "test/**"],
    },
  },
})
