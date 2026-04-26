import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
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
        "/auth": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/users": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/api": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/locations": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/levels": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/marketplace": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/images": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/verification": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/posts": { target: env.VITE_API_BASE_URL, changeOrigin: true },
        "/comments": { target: env.VITE_API_BASE_URL, changeOrigin: true },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.tsx",
      include: [
        "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
        "src/**/*.integration.test.{js,ts,jsx,tsx}",
      ],
      exclude: ["node_modules", "dist", "e2e", "develop", ".git", ".cache"],
      testTimeout: 60000,
      hookTimeout: 60000,
      fileParallelism: false,
    },
  };
});
