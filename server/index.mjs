import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { demoCatalog, loadLedger, statuses } from '../lib/catalog.mjs';
import { search, related } from '../lib/search.mjs';

const allowedHosts = new Set(['127.0.0.1', 'localhost']);
export function createArsenalServer({ intakeDir = '', catalogLoader } = {}) {
  const load = catalogLoader || (() => intakeDir ? loadLedger(intakeDir) : demoCatalog);
  return createServer({ maxHeaderSize: 8192, requestTimeout: 10000 }, async (req, res) => {
    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'same-origin', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" });
      res.end(JSON.stringify(payload));
    };
    try {
      const host = req.headers.host || '';
      const base = new URL(`http://${host}`);
      if (!allowedHosts.has(base.hostname) || base.username || base.password || base.host !== host || Number(base.port || 80) !== req.socket.localPort) return send(403, { error: 'Localhost access only.' });
      if (req.headers.origin && req.headers.origin !== base.origin) return send(403, { error: 'Cross-origin access denied.' });
      if (req.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'Cross-site access denied.' });
      if (req.method !== 'GET') return send(405, { error: 'Read-only API.' });
      if ((req.url || '').length > 4096) return send(414, { error: 'Request is too long.' });
      const url = new URL(req.url, base);
      if (url.pathname === '/api/health') return send(200, { service: 'ui-arsenal', local: true, searchMode: 'local-vocabulary', externalCalls: false });
      if (url.pathname === '/') return send(200, { service: 'UI Arsenal', stage: 'API foundation; UI awaits design selection', endpoints: ['/api/catalog', '/api/search?q=moving%20sidebar'] });
      if (!['/api/catalog', '/api/search'].includes(url.pathname) && !/^\/api\/components\/[^/]+(?:\/related)?$/.test(url.pathname)) return send(404, { error: 'Not found.' });
      let catalog;
      try { catalog = await load(); } catch { return send(503, { error: 'Configured catalog is unavailable. Check the local intake file; sample data has not been substituted.' }); }
      if (url.pathname === '/api/catalog') return send(200, { mode: intakeDir ? 'intake' : 'demo', total: catalog.length, components: catalog });
      if (url.pathname === '/api/search') {
        const status = url.searchParams.get('status') || undefined;
        const category = url.searchParams.get('category') || undefined;
        const limit = Number(url.searchParams.get('limit') || 50);
        if (status && !statuses.has(status)) return send(400, { error: 'Unknown status filter.' });
        try { return send(200, search(catalog, url.searchParams.get('q') || '', { status, category, limit })); }
        catch (error) { return send(400, { error: error.message }); }
      }
      const id = decodeURIComponent(url.pathname.split('/')[3]);
      const item = catalog.find(x => x.id === id);
      if (!item) return send(404, { error: 'Component not found.' });
      return send(200, url.pathname.endsWith('/related') ? { results: related(catalog, id) } : { component: item });
    } catch { return send(400, { error: 'Invalid request.' }); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5337);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('PORT must be an integer between 1024 and 65535.');
  const server = createArsenalServer({ intakeDir: process.env.ARSENAL_INTAKE_DIR });
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Port is occupied. Choose another PORT.' : 'Local server failed.'); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`UI Arsenal: http://127.0.0.1:${port} (loopback only)`));
}
