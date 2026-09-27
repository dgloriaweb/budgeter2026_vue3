# Budgeter 2026 (Frontend)

Vue 3 + Vite frontend for Budgeter 2026.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project setup

~~~sh
npm install
~~~

## Run locally (dev)

~~~sh
npm run dev
~~~

Vite serves at http://localhost:5173/.

## Build (production)

~~~sh
npm run build
~~~

## Lint

~~~sh
npm run lint
~~~

## Auth (token-based API)

- Login/register uses POST /api/login and POST /api/register (API returns { user, token }).
- Token is stored in localStorage as budgeter2026_auth_token and sent as Authorization: Bearer <token>.
- Protected pages require a token (see router guard in src/router/index.js).

## Pages (routes)

- / and /login: Login
- /register: Register
- /dashboard: Dashboard (protected)
- /expenses: Expenses spreadsheet view (protected)
- /main: Upcoming transactions

Top-right header includes a hamburger menu (Dashboard/Expenses) and a user icon menu (Logout).

## API base URL (dev vs Netlify)

- Dev (localhost): calls /api/* and uses Vite dev proxy (vite.config.js) → http://localhost:8081.
- Production/Netlify: set env var VITE_API_BASE_URL=https://dgloriaapi.co.uk (read at build time).

## Styling

Global styles live in src/styles/app.css and are imported from src/main.js.

## TODO

- Make the **Budgeter** title clickable to return to /dashboard.
- Set up an **incomes** table and merge it into the report as **positive** items (consider a swipe UI to switch between expenses/incomes).
- Remove the dashboard subtitle total (currently shows a huge number like Total:5487584).
- “Log a paid bill” should show the **expenses list** in the dropdown, starting from the **next upcoming** item by day.
- Remove the **category** input and show **database-backed data** instead.
