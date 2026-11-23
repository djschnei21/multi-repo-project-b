# todo-api (multi-repo-project-b): backend

This repo is the backend of a two-repo project. The frontend is
`multi-repo-project-a` (todo-web), which calls this API.

## Stack
- Node 20+, ES modules, no npm dependencies. Use only the Node standard library.
- Routes are in `src/app.js` and the in-memory store is in `src/store.js`.
- Tests use `node:test` and live in `test/`. Run them with `npm test`.

## Cross-repo contract
- `openapi.yaml` in this repo is the source of truth for the API.
- If you add or change an endpoint or a field, update `openapi.yaml`, the handler,
  and the tests in this repo. Then update the frontend's API client
  (`public/api.js` in multi-repo-project-a) and its tests in the same task.
- Do not make breaking changes to existing fields. Add new optional fields instead.

## Cursor Cloud specific instructions
- In a multi-repo environment the frontend is checked out next to this repo
  (`../multi-repo-project-a`).
- Start the API with `npm start` (port 4000) before you run the frontend.
- Run `npm test` in both repos before you open pull requests, and open one PR per repo.
