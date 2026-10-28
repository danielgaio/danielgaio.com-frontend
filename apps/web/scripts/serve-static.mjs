import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join, resolve, sep } from "node:path";

const root = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method ?? "GET")) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname); }
  catch { response.writeHead(400); response.end("Bad request"); return; }
  let target = resolve(root, "." + pathname);
  if (target !== root && !target.startsWith(root + sep)) { response.writeHead(403); response.end("Forbidden"); return; }
  let status = 200;
  try {
    if ((await stat(target)).isDirectory()) target = join(target, "index.html");
    await stat(target);
  } catch { target = join(root, "404.html"); status = 404; }
  try {
    const content = await readFile(target);
    response.writeHead(status, { "Content-Type": types[extname(target)] ?? "application/octet-stream", "Content-Length": content.length, "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch { response.writeHead(500); response.end("Build the static site before starting the preview server."); }
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, process.env.HOST ?? "0.0.0.0", () => { console.log(`Static website: http://127.0.0.1:${port}`); });
