import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Every deployable exposes /health/live and /health/ready (RULES.md #4),
 * including this static SPA — there's nothing to check, so both just
 * confirm the server is up. The production static server (server.mjs)
 * implements the same two routes.
 */
function healthCheck(): Plugin {
  return {
    name: "aca-health-check",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/health/live" || req.url === "/health/ready") {
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ status: "ok" }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), healthCheck()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          // Large feature libraries
          "graph-viz": ["reactflow"],
          "markdown": ["react-markdown"],
          "syntax": ["prismjs"],
        },
      },
    },
    chunkSizeWarningLimit: 1024,
  },
});
