# Vitel

Vitel is a React-based web app for ATP tennis statistics. The app fetches data from a backend API and powers many views through SQL files that are loaded automatically in the frontend.

## Recent Updates

- 2026-02-27: `/live` replaced the textual refresh countdown with a subtle centered dot indicator that fills up over each 30-second refresh cycle.
- 2026-02-27: `/live` now shows a visible countdown to the next 30-second refresh so users can see when the page will update.
- 2026-02-27: `/live` now auto-refreshes every 30 seconds. `useRequest` and `useSQL` also accept pass-through TanStack Query options so polling can be enabled per page.
- 2026-02-27: `/live` now shows a `Tidigare möten` column with the current head-to-head record for each visible player pair, computed from `flatly`.
- 2026-02-27: `/live` now computes player rankings locally from the sorted `players` table, so rankings render without relying on any `rank` field in the live API payload.
- 2026-02-26: Fixed `/live` score display formatting to avoid corrupting live game-point brackets; e.g. `[4040]` now renders as `[40-40]` instead of `[4-0-4-0]`.
- 2026-02-26: Simplified `/live` grouping to stop client-side score interpretation; match grouping now relies on backend-provided `status` only.
- 2026-02-26: Fixed `/live` match grouping to avoid showing completed matches as ongoing by prioritizing explicit `status` (`Completed`/`Aborted`/`Walkover`) and improving score parsing for both compact (`64`) and hyphenated (`6-4`) set formats.

## Overview

- Frontend: React 19 + Vite 6 + Tailwind CSS v4
- Routing: `HashRouter` (React Router)
- Data fetching/cache: TanStack Query
- Backend: API with base URL via `VITE_API_URL`
- SQL endpoint: `POST /query` (via `src/js/service.js` and `src/js/vitel.js`)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start locally:

```bash
npm run run
```

3. Build for production:

```bash
npm run build
```

## Environment Variables

Create a `.env` file with at least:

```bash
VITE_API_URL=https://your-api-base-url
```

## NPM Scripts

- `npm run run` - starts the Vite dev server
- `npm run build` - builds to `dist/`
- `npm run preview` - previews the built app
- `npm run upload` - builds and uploads `dist/*` via `scp` to `router.egelberg.se`
- `npm run git-commit` - add/commit/push in one step

## Active Routes

`/`, `/app`, `/player/:id`, `/head-to-head/:A/:B`, `/event/:id`, `/ranking`, `/events`, `/players`, `/live`, `/log`, `/trial`, `/qna`, `/settings`, `/query/:name`, `/currently`, `/abc`, `/not-found`, and fallback `*` -> `NotFound`.

## Key Files

- `src/index.jsx` - app bootstrap, theme handling, and route wiring
- `src/pages/app/index.jsx` - landing page
- `src/js/service.js` - low-level API requests
- `src/js/vitel.js` - exports `service`, `useSQL`, `useRequest`
- `src/js/queries.js` - loads/parses `src/queries/*.sql`
- `src/database/schema.sql` - database source of truth
- `src/components/ui/markdown.jsx` - markdown rendering in the UI

## SQL Queries in Frontend

SQL files in `src/queries/*.sql` are loaded via `import.meta.glob` and used on `/query/:name`. The filename (without `.sql`) becomes the URL id.

Each SQL file can include metadata in the first comment block:

```sql
/*
@title
Title shown in the UI

@description
Description rendered as Markdown
*/
```

Current query files:
`best-form`, `biggest-upsets`, `decenial-slams`, `longest-matches-ever`, `match-turn-arounds`, `prize-money`, `prospects`, `ranking-climbers`, `titles-under-age-21`, `top-10-players`, `top-50-dropouts`, `underranked-players`, `who-is-the-goat`.

## Database (Summary)

Source of truth: `src/database/schema.sql`.

Key tables:
- `players`
- `matches`
- `events`
- `queries`
- `log`
- `settings`
- `storage`
- `archive`

Views:
- `flatly` (denormalized match/event/player view)
- `currently` (ongoing events/players)

Routines:
- Stored procedures such as `sp_update`, `sp_update_match_status`, `sp_update_match_duration`, `sp_update_surface_factors`
- Functions such as `IS_MATCH_COMPLETED`, `NUMBER_OF_SETS_PLAYED`, `NUMBER_OF_GAMES_PLAYED`, `NUMBER_OF_MINUTES_PLAYED`, `NUMBER_OF_SETS`, `NUMBER_OF_TIEBREAKS_PLAYED`
