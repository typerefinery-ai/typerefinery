"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = process.env.APP_ROOT
  ? path.resolve(process.env.APP_ROOT)
  : path.join(__dirname, "app");
const port = Number(process.env.PORT || process.env.SERVICE_PORT || 4210);
const host = process.env.HOST || process.env.SERVICE_HOST || "127.0.0.1";
const serviceName = process.env.SERVICE_NAME || "static-service";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

function sendNotFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
}

function resolveRequestPath(urlPath) {
  const rawPath = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = rawPath === "/" ? "/index.html" : rawPath;
  const candidatePath = path.normalize(path.join(rootDir, normalized));
  if (!candidatePath.startsWith(rootDir)) {
    return null;
  }
  return candidatePath;
}

const server = http.createServer((req, res) => {
  const requestedPath = resolveRequestPath(req.url || "/");
  if (!requestedPath) {
    sendNotFound(res);
    return;
  }

  fs.stat(requestedPath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(requestedPath, res);
      return;
    }

    const fallbackPath = path.join(rootDir, "index.html");
    fs.stat(fallbackPath, (fallbackErr, fallbackStats) => {
      if (!fallbackErr && fallbackStats.isFile()) {
        sendFile(fallbackPath, res);
        return;
      }

      sendNotFound(res);
    });
  });
});

server.listen(port, host, () => {
  console.log(`${serviceName} listening on http://${host}:${port}`);
});
