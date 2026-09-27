# Agent memory (b-frontend)

This file is a reminder for the AI agent working in this repo.

## Repo runtime / environment
- **Run locally**:
  - `npm install`
  - `npm run dev`
  - Vite default: `http://localhost:5173/`

## Working style (user expectations)
- Treat user edits as intentional: don’t “fix back” to recommendations.
- Don’t re-add removed features/sections unless explicitly requested.
- Prefer reusable Vue structure (components + composables) when UI/logic repeats, while still keeping changes minimal and localized.
- Don’t invent names/labels/requirements; stick to app naming and what’s in docs/code/user instructions.
- Don’t copy tokens/credentials into docs or repo files.

## API base URL behavior (dev vs production)
- **Dev (localhost)**: frontend should use same-origin requests like `fetch('/api/...')` and rely on Vite proxy.
- **Production (Netlify)**: frontend uses `VITE_API_BASE_URL` at build time.
  - Netlify env var: `VITE_API_BASE_URL=https://dgloriaapi.co.uk`

## Dev proxy (avoid CORS on localhost)
- In `vite.config.js`, proxy `/api/*` → `http://localhost:8081/api/*`.
- If `vite.config.js` changes, restart dev server.

## Auth model (Bearer token)
- Backend endpoints:
  - `POST /api/register` → `{ user, token }`
  - `POST /api/login` → `{ user, token }`
  - `GET /api/user` → requires `Authorization: Bearer <token>`
  - `POST /api/logout` → revokes current token
- Frontend token storage:
  - `localStorage` key: `budgeter2026_auth_token`
  - API helper auto-includes `Authorization` (when token exists) + `Accept: application/json`
  - Implementation: `src/api/api.js`

## Routes / pages (current)
- Routes are in `src/router/index.js`.
- Startup page: `/` → `MainView` (requires auth); `/main` is an alias.
- Auth pages: `/login`, `/register`.
- Other pages: `/dashboard`, `/expenses` (require auth).

## Local JSON data conventions (project)
- Use specific primary keys per JSON file (avoid generic `id`):
  - `account.json` → `account_id`
  - `recurrence.json` → `recurrence_id`
  - `transaction.json` → `transaction_id`
- References should use the same specific key name (e.g. transactions reference accounts via `account_id`).

