import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths(), tailwindcss()],
  server: {
    host: "localhost",
    port: 3000,
  },
  base: "/",
  build: {
    outDir: "build",
  },
});