# Budgeter 2026 (Frontend)

Vue 3 + Vite frontend for Budgeter 2026.

## Run locally

```sh
npm install
npm run dev
```

## App notes (non-obvious)
- Token auth uses `localStorage` key: `budgeter2026_auth_token` (sent as `Authorization: Bearer <token>`).
- Startup page is `/` (Main, protected). `/main` is an alias.
- Other protected pages: `/dashboard`, `/expenses`.
- Postman collection: `storage/app/private/scribe/collection.json`
- phpMyAdmin: `http://127.0.0.1:8082/` (or `http://127.0.0.1:8082/phpmyadmin/` after container recreate)
- Start backend containers (local): `sail up -d`
- Clear backend caches (local, when config/routes change): `sail artisan optimize:clear`
- Generate API docs + Postman (local): `sail artisan scribe:generate`



## Phase 1: Frontend Mock Pages & Local State (Vue 3)

1. **Design Account Dashboard View**: Build a clean mobile-first view listing all user accounts and their current balances.
2. **Build Balance Update Form**: Create a quick action flow to update an account balance instantly with zero friction.
3. **Build Bill Entry Form**: Create a simple form interface to log a paid bill (amount, category, date, account used).
4. **Mock Persistence**: Wire these views up to local storage or local JSON structures so the entire user flow can be tested end-to-end without touching the database yet.
5. **API client env targeting (already set up)**:
   - Local dev: call same-origin `/api/...` (Vite dev proxy)
   - Production: set `VITE_API_BASE_URL` (Netlify) to `https://dgloriaapi.co.uk`

## Phase 2: Backend Database & Migration Verification

1. **Inspect DB schema**: Use frontend json files to plan the laravel migrations. 
2. **Finalize schema in migrations (minimal + safe)**
   - `expense` table is **singular** (we do not follow Laravel plural defaults here).
   - Add missing columns via additive migrations (eg `user_id`) to match API filtering.
   - Avoid creating duplicate tables when legacy tables already exist (eg existing `account` table).

## Phase 3: Core API Endpoint Development (Laravel 13)

1. **Auth API (done)**
   - Public: `POST /api/register`, `POST /api/login`, `POST /api/auth`
   - Protected: `GET /api/user`, `POST /api/logout`
2. **Expenses API (in place)**
   - Protected: `GET /api/expenses` (scoped to authenticated user via `expense.user_id`)
   - Next: `POST /api/expenses` (create one expense row)
3. **Accounts API (next)**
   - Define endpoints that match the existing `account` table shape (currently legacy columns like `account_id`, `account_name`, etc.).
4. **API Documentation (ongoing)**
   - Keep Scribe annotations accurate so Postman stays correct.

## Phase 4: Frontend-to-Backend Integration

1. **End-to-End Testing**: Test checking balances, updating balances, and logging bills from the live frontend to the live server.

## Phase 5: Production Polish & Hardening

1. **Turn Off Debug Mode**: Execute the production command to disable debug on the live environment (`APP_DEBUG=false`).
2. **Deploy + clear caches**: After deploying, run `php artisan optimize:clear` (or equivalent) on the server so routes/config changes take effect.


## Roadmap / TODO

### Phase 1 (frontend mock UX + local state)
- [ ] **Account balances + persistence**: make balances real (mock-real) using local JSON + `localStorage` so totals make sense.
- [ ] **Dashboard cleanup**:
  - [ ] remove “include all accounts”; base totals on current accounts and keep “include savings”
  - [ ] remove duplicate total fields
  - [ ] remove Cash (if still present)
  - [ ] delete “Log a paid bill” section
  - [ ] add add/edit accounts link from Account Balances
- [ ] **Main page**: add a “mark as paid” button in the last column (mock behavior).

### Exchange rates / totals
- [ ] pull Wise current exchange rate (if possible) + show exchange rates for Wise.
- [ ] total amount as sum of HUF, GBP, etc. (define conversion approach).

### Later (backend + admin UI)
- [ ] create database schema/migrations based on the JSON files.
- [ ] create add/edit transaction page.
