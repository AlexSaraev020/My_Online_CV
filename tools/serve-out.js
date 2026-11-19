#!/usr/bin/env node
/* Serves the static export in out/ so the built site can be looked at without
   a hosting account:  npm run build && npm run serve
   node tools/serve-out.js 8080 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..', 'out');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const port = Number(process.argv[2] || process.env.PORT || 3000);

if (!fs.existsSync(ROOT)) {
  console.error('serve-out: out/ does not exist. Run npm run build first.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const base = path.join(ROOT, url);

  /* the same resolution a real static host does: the file, then <name>.html,
     then a directory index — the export writes work/<slug>.html next to the
     payload folder work/<slug>/ */
  const file = [base, `${base}.html`, path.join(base, 'index.html')]
    .find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());

  if (!file) {
    const missing = path.join(ROOT, '404.html');
    if (fs.existsSync(missing)) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      fs.createReadStream(missing).pipe(res);
    } else {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
    return;
  }

  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, () => console.log(`out/ served at http://localhost:${port}`));
