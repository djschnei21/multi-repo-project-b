# multi-repo-project-b: todo-api (backend)

The backend half of a two-repo Cursor demo. It is a tiny in-memory Todo REST API
built on Node's standard library, with no npm dependencies.

| Repo | Role | Default port |
| --- | --- | --- |
| [multi-repo-project-a](https://github.com/djschnei21/multi-repo-project-a) | `todo-web`, the frontend | 3000 |
| **multi-repo-project-b** (this repo) | `todo-api`, the backend | 4000 |

The API contract shared by both repos lives here in [`openapi.yaml`](./openapi.yaml).

## Run it

```bash
npm start        # http://localhost:4000
npm run dev      # restarts on file changes
npm test         # node:test suite
```

```bash
curl localhost:4000/api/todos
curl -X POST localhost:4000/api/todos -H 'Content-Type: application/json' -d '{"title":"Try the demo"}'
```

## Layout

```text
src/app.js        HTTP routes
src/store.js      in-memory todo store
src/index.js      entry point (reads PORT)
test/             node:test suite
openapi.yaml      API contract, source of truth for both repos
AGENTS.md         instructions for Cursor agents
.cursor/rules/    Cursor rules for this repo
```

See the frontend repo's README for demo prompts that change both repos at once.
