import { defineConfig } from "vite";

export default defineConfig({
  base: "/taobaorm_beitaiyun/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
