#!/usr/bin/env node
// Minimal production static file server for the built SPA. Serves dist/,
// falls back to index.html for client-side routes, and answers
// /health/live and /health/ready — every deployable exposes both
// (RULES.md #4), even a static frontend with nothing to check.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const port = Number(process.env.PORT ?? 5173);

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  res.writeHead(200, { "content-type": MIME_TYPES[ext] ?? "application/octet-stream" });
  res.end(await readFile(filePath));
}

createServer(async (req, res) => {
  if (req.url === "/health/live" || req.url === "/health/ready") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  const requestedPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const filePath = path.join(distDir, requestedPath === "/" ? "index.html" : requestedPath);

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("not a file");
    await serveFile(filePath, res);
  } catch {
    // SPA fallback: unknown paths resolve client-side via react-router.
    await serveFile(path.join(distDir, "index.html"), res);
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`web listening on :${port}`);
});
