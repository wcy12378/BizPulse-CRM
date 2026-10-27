/** Dependency-free, loopback-only fictional sandbox. Never loads .env or business code. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const routes = new Map([
  ['/', ['examples/offline-sandbox/index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['examples/offline-sandbox/app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['examples/offline-sandbox/style.css', 'text/css; charset=utf-8']],
  ['/logo.svg', ['docs/brand/shangmai-logo.svg', 'image/svg+xml']],
]);
const port = Number(process.env.DEMO_OFFLINE_PORT || 3030);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid DEMO_OFFLINE_PORT');
const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'");
  let pathname;
  try {
    pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  } catch {
    response.writeHead(400).end('Invalid request URL'); return;
  }
  const asset = routes.get(pathname);
  if (!['GET', 'HEAD'].includes(request.method) || !asset) {
    response.writeHead(404).end('Not found'); return;
  }
  try {
    const body = await readFile(new URL(asset[0], root));
    response.writeHead(200, { 'Content-Type': asset[1] });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end('Sandbox asset unavailable');
  }
});
server.on('error', (error) => { console.error(`Offline sandbox: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`商脉 / Shangmai — fictional offline sandbox\nhttp://127.0.0.1:${port}\nNode.js only; no install, .env, database or API key required. Ctrl+C to stop.`));
