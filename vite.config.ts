import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { apiDevMiddleware } from "./api/_lib/devMiddleware";

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevMiddleware()],
});
