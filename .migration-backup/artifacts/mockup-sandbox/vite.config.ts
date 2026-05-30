const rawPort = process.env.PORT || "3000";
const basePath = process.env.BASE_PATH || "/";
const port = Number(rawPort) || 3000;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    port,
  },
  build: {
    outDir: "dist",
  },
});
