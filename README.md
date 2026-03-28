# Vitel

Vitel is a React + Vite web application for ATP tennis stats, live match monitoring, and odds overview.

The frontend is statically served and talks to a backend API for SQL data, live match data, and Oddset data.

## Highlights

- ATP-focused dashboards and pages (`/live`, `/oddset`, `/players`, `/events`, etc.)
- Player pages and head-to-head summaries share a reusable player title with country flag and optional Wikipedia link
- Live monitor view for active matches (`/scoreboard`)
- Odds page (`/oddset`) powered by backend `GET /api/oddset`
- SQL-driven query explorer (`/query/:name`) loading SQL files from `src/queries/*.sql`
- Theme system with auto mode (`light|dark` + `hard|clay|grass`)
- Theme keyboard shortcuts: `F6` toggles light/dark mode and `F3` cycles `hard / grass / clay`
- Trial page (`/trial`) for quick UI and component experiments

## Related Repositories

- Frontend (this repo): `meg768/vitel`
- Backend API: [`meg768/atp-tennis`](https://github.com/meg768/atp-tennis)

`/oddset` depends on the backend endpoint implemented in the server repo:

- `GET /api/oddset`

## Tech Stack

- React 19
- Vite 6
- Tailwind CSS v4
- TanStack Query
- React Router (`HashRouter`)

## Requirements

- Node.js 18+ (recommended: latest LTS)
- npm
- A running backend API reachable via `VITE_API_URL`

## Quick Start

```bash
npm install
cp .env.local .env
npm run run
```

Open the app in your browser at the URL shown by Vite (usually `http://localhost:5173`).

## Environment Variables

Create `.env` (or use `.env.local`/`.env.production`) with:

```bash
VITE_API_URL=http://localhost:3004/api
```

`VITE_API_URL` is required. The frontend uses it for backend calls like:

- `GET {VITE_API_URL}/live`
- `GET {VITE_API_URL}/oddset`
- `GET {VITE_API_URL}/oddset?states=STARTED`
- `POST {VITE_API_URL}/query`

## Backend API Contract

All paths below are relative to `VITE_API_URL` (for example `VITE_API_URL=http://localhost:3004/api`).

### `GET /oddset`

Expected response: JSON array where each row has nested `playerA`/`playerB`.

```json
[
  {
    "start": "2026-03-12T01:00:00Z",
    "tournament": "Indian Wells",
    "score": null,
    "playerA": { "name": "Novak Djokovic", "odds": 1.71 },
    "playerB": { "name": "Jack Draper", "odds": 2.18 }
  }
]
```

Notes:

- `/oddset` currently expects this nested shape.
- `score` is used to infer live/upcoming grouping (`score != null` => live).
- The same endpoint is also used by `/matches` and `/scoreboard` with `states=STARTED`, so the frontend no longer fetches Oddset/Kambi directly for live odds.

### `GET /live`

Expected response: JSON array of live/finished ATP match rows used by `/live` and `/scoreboard`.

### `POST /query`

Request body:

```json
{
  "sql": "SELECT ...",
  "format": []
}
```

Response: JSON rows from your database query.

## Routes

Main client routes:

- `/` redirects to `/app`
- `/app`
- `/player/:id`
- `/head-to-head/:A/:B`
- `/head-to-head-details/:A/:B`
- `/event/:id`
- `/events`
- `/players`
- `/live`
- `/oddset`
- `/matches`
- `/scoreboard`
- `/scoreboard/:A/:B`
- `/log`
- `/qna`
- `/trial`
- `/settings`
- `/query/:name`
- `/not-found`
- `/live-matches-overview` redirects to `/matches`
- `/live-matches-detail` redirects to `/scoreboard`

## Keyboard Shortcuts

- `F3` cycles between `hard`, `grass`, and `clay`
- `F6` toggles between light and dark mode

## SQL Query System

- SQL files live in `src/queries/*.sql`
- Loaded via `import.meta.glob` in `src/js/queries.js`
- Filename (without `.sql`) becomes route id for `/query/:name`
- Head-to-head detail questions live locally in `src/pages/head-to-head-details/queries/*.sql`
- These are loaded by `src/pages/head-to-head-details/queries.js` for `/head-to-head-details/:A/:B`
- Metadata can be included in the first SQL block comment:

```sql
/*
@title
Your title

@description
Markdown description
*/
```

## Project Structure

```text
src/
  components/      Reusable UI and domain components
  pages/           Route pages
  js/              Data/services/helpers
  queries/         SQL files used by /query/:name
  database/        Schema and routines source of truth
```

Important files:

- `src/index.jsx` - app bootstrap, theme handling, route wiring
- `src/js/service.js` - API wrapper based on `VITE_API_URL`
- `src/js/vitel.js` - `useRequest`, `useSQL`, shared service export
- `src/components/player-title.jsx` - shared player title used on player pages and head-to-head summaries
- `src/pages/head-to-head-details/index.jsx` - SQL-driven head-to-head details page
- `src/pages/head-to-head-details/queries.js` - loader for local head-to-head detail queries
- `src/pages/oddset/index.jsx` - `/oddset` page
- `src/pages/live/index.jsx` - `/live` page
- `src/pages/matches/index.jsx` - `/matches` overview page
- `src/pages/scoreboard/index.jsx` - `/scoreboard` monitor page
- `src/database/schema.sql` - DB schema baseline, including the `players.wikipedia` field used by the UI

## Scripts

- `npm run run` - start Vite dev server
- `npm run build` - production build to `dist/`
- `npm run preview` - preview built app
- `npm run git-backup` - commit dirty changes as `backup`, push current branch, and force-push a `backup/<branch>` branch
- `npm run git-commit` - add all changes, commit with `-`, and push
- `npm run git-delete-backup` - delete the remote `backup/<branch>` branch and prune refs
- `npm run git-restore` - hard-reset current branch to `origin/backup/<branch>` and force-push it back
- `npm run upload` - build and upload `dist/*` to server via `scp`
- `npm run "goto GitHub"` - open repository in browser (macOS `open`)

## Deployment Notes

- The app uses `HashRouter`, which is suitable for static hosting without server-side route rewrites.
- Build output is generated in `dist/`.
- The included `upload` script deploys static assets to `router.egelberg.se`.

## Troubleshooting

- `Failed to fetch url ...` in UI:
  - Verify backend is running and `VITE_API_URL` is correct.
- `/oddset` error:
  - Verify `GET /api/oddset` returns HTTP 200 and the nested `playerA`/`playerB` shape above.
- Missing player links/flags/rank on `/oddset`:
  - Name matching against DB is normalization-based; unmatched names will not resolve to `id/country/rank`.
