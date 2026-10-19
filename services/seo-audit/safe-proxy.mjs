import { createServer as createHttpServer, request as httpRequest } from 'node:http';
import { connect as tcpConnect } from 'node:net';
import { lookup } from 'node:dns/promises';
import { resolveTarget } from './audit.mjs';

const hopByHop = new Set(['connection', 'proxy-connection', 'proxy-authenticate', 'proxy-authorization', 'keep-alive', 'upgrade', 'transfer-encoding']);

export async function startSafeProxy({ resolver = lookup, maxRequests = 250 } = {}) {
  let requests = 0;
  const server = createHttpServer((req, res) => {
    void (async () => {
      if (++requests > maxRequests) { res.writeHead(429).end(); return; }
      let url;
      try { url = new URL(req.url); } catch { res.writeHead(400).end(); return; }
      if (url.protocol !== 'http:' || url.username || url.password || (url.port && url.port !== '80')) { res.writeHead(403).end(); return; }
      try {
        const target = await resolveTarget(url.href, resolver);
        const headers = Object.fromEntries(Object.entries(req.headers).filter(([name]) => !hopByHop.has(name.toLowerCase())));
        headers.host = url.host;
        const upstream = httpRequest(target.url, {
          method: req.method, path: `${url.pathname}${url.search}`, headers, agent: false,
          lookup: (_host, options, callback) => options.all
            ? callback(null, [target.address]) : callback(null, target.address.address, target.address.family),
        }, (response) => {
          const responseHeaders = Object.fromEntries(Object.entries(response.headers).filter(([name]) => !hopByHop.has(name.toLowerCase())));
          res.writeHead(response.statusCode || 502, responseHeaders);
          response.pipe(res);
        });
        upstream.setTimeout(20_000, () => upstream.destroy(new Error('proxy_timeout')));
        upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
        req.pipe(upstream);
      } catch {
        if (!res.headersSent) res.writeHead(403);
        res.end();
      }
    })();
  });

  server.on('connect', (req, client, head) => {
    void (async () => {
      if (++requests > maxRequests) { client.end('HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\n\r\n'); return; }
      try {
        const url = new URL(`https://${req.url}`);
        if (url.port && url.port !== '443') throw new Error('port_blocked');
        const target = await resolveTarget(url.href, resolver);
        const upstream = tcpConnect({ host: target.address.address, port: 443, family: target.address.family });
        upstream.setTimeout(20_000, () => upstream.destroy(new Error('proxy_timeout')));
        upstream.once('connect', () => {
          client.write('HTTP/1.1 200 Connection Established\r\nProxy-Agent: ElevatorAudit\r\n\r\n');
          if (head.length) upstream.write(head);
          upstream.pipe(client); client.pipe(upstream);
        });
        upstream.on('error', () => client.destroy());
        client.on('error', () => upstream.destroy());
        client.on('close', () => upstream.destroy());
      } catch {
        client.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      }
    })();
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  return {
    port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
