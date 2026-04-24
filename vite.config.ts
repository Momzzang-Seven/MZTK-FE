import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@constant": path.resolve(__dirname, "src/constant"),
      "@components": path.resolve(__dirname, "src/components"),
      "@interface": path.resolve(__dirname, "src/interface"),
      "@services": path.resolve(__dirname, "src/services"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@store": path.resolve(__dirname, "src/store"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@context": path.resolve(__dirname, "src/context"),
      "@abi": path.resolve(__dirname, "src/abi"),
      "@mocks": path.resolve(__dirname, "src/mocks"),
    },
  },
  server: {
    port: 3000,
    host: "localhost",
    proxy: {
      "/auth": "http://localhost:8080",
      "/users": "http://localhost:8080",
      "/api": "http://localhost:8080",
      "/locations": "http://localhost:8080",
      "/levels": "http://localhost:8080",
      "/marketplace": "http://localhost:8080",
      "/images": "http://localhost:8080",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.tsx",
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'src/**/*.integration.test.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e', '.git', '.cache'],
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,

  },
});
