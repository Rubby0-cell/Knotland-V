import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== "production";

// Only require PORT in development (Vite dev server). Provide a default otherwise.
const rawPort = process.env.PORT ?? (isDev ? "5173" : undefined);
let port: number | undefined;
if (rawPort !== undefined) {
  const p = Number(rawPort);
  if (Number.isNaN(p) || p <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  port = p;
}

// Allow a sensible default for BASE_PATH in production; you can override with env var.
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    // Use the Replit dev-only plugins only in dev when REPL_ID is set.
    ...(isDev && process.env.REPL_ID !== undefined
      ? [
          // top-level await is allowed in ESM Vite config; these imports are dev-only
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(__dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    // Only set port when defined (dev). For builds, Vite's build doesn't need server.port.
    ...(port ? { port, strictPort: true } : {}),
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    ...(port ? { port } : {}),
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
