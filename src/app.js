import { createServer } from 'node:http';
import { createStore } from './store.js';

const DEFAULT_SEED = [
  { title: 'Open both repos in Cursor' },
  { title: 'Ask the agent for a cross-repo feature' },
];

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function validateTitle(title) {
  return typeof title === 'string' && title.trim().length > 0;
}

export function createApp({ store = createStore(DEFAULT_SEED) } = {}) {
  return createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (req.method === 'OPTIONS') return send(res, 204);

    if (pathname === '/api/health' && req.method === 'GET') {
      return send(res, 200, { status: 'ok' });
    }

    if (pathname === '/api/todos') {
      if (req.method === 'GET') return send(res, 200, store.list());

      if (req.method === 'POST') {
        const body = await readJson(req);
        if (!body || !validateTitle(body.title)) {
          return send(res, 400, { error: 'title is required' });
        }
        return send(res, 201, store.add({ title: body.title.trim() }));
      }

      return send(res, 405, { error: 'method not allowed' });
    }

    const match = pathname.match(/^\/api\/todos\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);

      if (req.method === 'PATCH') {
        const body = await readJson(req);
        if (!body) return send(res, 400, { error: 'invalid JSON' });

        const changes = {};
        if ('title' in body) {
          if (!validateTitle(body.title)) {
            return send(res, 400, { error: 'title must be a non-empty string' });
          }
          changes.title = body.title.trim();
        }
        if ('done' in body) {
          if (typeof body.done !== 'boolean') {
            return send(res, 400, { error: 'done must be a boolean' });
          }
          changes.done = body.done;
        }

        const todo = store.update(id, changes);
        return todo ? send(res, 200, todo) : send(res, 404, { error: 'not found' });
      }

      if (req.method === 'DELETE') {
        return store.remove(id) ? send(res, 204) : send(res, 404, { error: 'not found' });
      }

      return send(res, 405, { error: 'method not allowed' });
    }

    return send(res, 404, { error: 'not found' });
  });
}
