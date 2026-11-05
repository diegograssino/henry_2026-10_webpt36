import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom simula el DOM del navegador para que React pueda renderizar en los tests
    environment: "jsdom",
    // globals: true habilita describe/it/expect sin tener que importarlos en cada archivo
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
