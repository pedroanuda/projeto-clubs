import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths(), tailwindcss()],
  server: {
    host: host || "localhost",
    port: 3000,
    strictPort: true,
    hmr: host ? {
      protocol: 'ws',
      host,
      port: 3001,
    } : undefined
  },
  base: "/",
  build: {
    outDir: "build",
    target: 'esnext',
  },
});