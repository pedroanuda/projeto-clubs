import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],
  server: {
    host: "localhost",
    port: 3000,
  },
  base: "/",
  build: {
    outDir: "build",
  },
});