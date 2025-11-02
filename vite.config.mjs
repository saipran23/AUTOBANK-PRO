import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

export default defineConfig({
    build: {
        outDir: "build",
        chunkSizeWarningLimit: 2000,
    },
    plugins: [tsconfigPaths(), react(), tagger()],
    server: {
        port: "4028",
        host: "0.0.0.0",
        strictPort: true,
        allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],

        // ✅ PROXY SECTION — KEEP THIS
        proxy: {
            "/api": {
                target: "https://apisandbox.openbankproject.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
