import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { startSafeProxy } from './safe-proxy.mjs';

test('egress proxy rejects private hosts for CONNECT and plain HTTP', async () => {
  const proxy = await startSafeProxy({ resolver: async () => [{ address: '127.0.0.1', family: 4 }] });
  try {
    const connectResponse = await new Promise((resolve, reject) => {
      const req = request({ host: '127.0.0.1', port: proxy.port, method: 'CONNECT', path: 'private.example:443' });
      req.once('connect', (res, socket) => { resolve(res.statusCode); socket.destroy(); });
      req.once('error', reject); req.end();
    });
    assert.equal(connectResponse, 403);

    const httpResponse = await new Promise((resolve, reject) => {
      const req = request({ host: '127.0.0.1', port: proxy.port, method: 'GET', path: 'http://private.example/path' }, (res) => {
        res.resume(); res.once('end', () => resolve(res.statusCode));
      });
      req.once('error', reject); req.end();
    });
    assert.equal(httpResponse, 403);
  } finally { await proxy.close(); }
});
