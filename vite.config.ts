import { defineConfig } from "vite-plus";
export default defineConfig({
  test: { testTimeout: 30000 },
  pack: {
    entry: { plugin: "src/plugin.ts" },
    outDir: "dist",
    format: "esm",
    platform: "node",
    target: "node24",
    clean: true,
    deps: { alwaysBundle: () => true, onlyBundle: false },
  },
});
