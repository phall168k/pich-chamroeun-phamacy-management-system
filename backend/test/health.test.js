import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

test('API health and unknown routes', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok', service: 'expressjs' });
    assert.equal((await fetch(`${base}/missing`)).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
