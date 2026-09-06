const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { app } = require('../index');

describe('API Route Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET / returns 200 with service info and endpoint directory', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.name, 'Fitness Tracker API');
    assert.strictEqual(data.status, 'online');
    assert.ok(data.endpoints);
    assert.strictEqual(data.endpoints.health, '/health');
  });

  it('GET /health returns 200 with { status: "ok" }', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.deepStrictEqual(data, { status: 'ok' });
  });

  it('GET /unknown-route returns 404 with structured JSON error', async () => {
    const res = await fetch(`${baseUrl}/unknown-endpoint-xyz`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Not Found');
    assert.strictEqual(data.message, 'Cannot GET /unknown-endpoint-xyz');
  });
});
