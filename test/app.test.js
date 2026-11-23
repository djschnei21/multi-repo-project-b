import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';

let server;
let baseUrl;

beforeEach(async () => {
  server = createApp({ store: createStore([{ title: 'seeded' }]) });
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

afterEach(() => new Promise((resolve) => server.close(resolve)));

const request = (path, options = {}) =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    body: options.body && JSON.stringify(options.body),
  });

test('GET /api/health reports ok', async () => {
  const res = await request('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /api/todos lists todos', async () => {
  const res = await request('/api/todos');
  const todos = await res.json();
  assert.equal(res.status, 200);
  assert.equal(todos.length, 1);
  assert.equal(todos[0].title, 'seeded');
  assert.equal(todos[0].done, false);
});

test('POST /api/todos creates a todo', async () => {
  const res = await request('/api/todos', { method: 'POST', body: { title: '  Write docs  ' } });
  const todo = await res.json();
  assert.equal(res.status, 201);
  assert.equal(todo.title, 'Write docs');
  assert.equal(todo.done, false);
  assert.equal(typeof todo.id, 'number');
});

test('POST /api/todos rejects a missing title', async () => {
  const res = await request('/api/todos', { method: 'POST', body: {} });
  assert.equal(res.status, 400);
});

test('todos without tags have an empty tags array', async () => {
  const todos = await (await request('/api/todos')).json();
  assert.deepEqual(todos[0].tags, []);
  const created = await (await request('/api/todos', { method: 'POST', body: { title: 'x' } })).json();
  assert.deepEqual(created.tags, []);
});

test('POST /api/todos normalizes tags', async () => {
  const res = await request('/api/todos', {
    method: 'POST',
    body: { title: 'Tagged', tags: [' Work ', 'urgent', 'work', ''] },
  });
  assert.equal(res.status, 201);
  assert.deepEqual((await res.json()).tags, ['work', 'urgent']);
});

test('POST /api/todos rejects tags that are not an array of strings', async () => {
  for (const tags of ['work', [1], null]) {
    const res = await request('/api/todos', { method: 'POST', body: { title: 'x', tags } });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'tags must be an array of strings' });
  }
});

test('PATCH /api/todos/:id replaces tags', async () => {
  const res = await request('/api/todos/1', { method: 'PATCH', body: { tags: ['Home'] } });
  assert.equal(res.status, 200);
  const todo = await res.json();
  assert.deepEqual(todo.tags, ['home']);
  assert.equal(todo.title, 'seeded');
});

test('PATCH /api/todos/:id rejects invalid tags', async () => {
  const res = await request('/api/todos/1', { method: 'PATCH', body: { tags: 'home' } });
  assert.equal(res.status, 400);
});

test('PATCH /api/todos/:id marks a todo done', async () => {
  const res = await request('/api/todos/1', { method: 'PATCH', body: { done: true } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).done, true);
});

test('PATCH /api/todos/:id rejects a non-boolean done', async () => {
  const res = await request('/api/todos/1', { method: 'PATCH', body: { done: 'yes' } });
  assert.equal(res.status, 400);
});

test('DELETE /api/todos/:id removes a todo', async () => {
  const del = await request('/api/todos/1', { method: 'DELETE' });
  assert.equal(del.status, 204);
  const missing = await request('/api/todos/1', { method: 'DELETE' });
  assert.equal(missing.status, 404);
});
