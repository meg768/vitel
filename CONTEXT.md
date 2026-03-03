# Vitel

Vitel is a React-based web app for ATP tennis statistics. The app fetches data from a backend API and powers many views through SQL files that are loaded automatically in the frontend.

## Recent Updates

- 2026-03-03: `/live` now renders the inline `triangle-right` live-match icon inside a small `border` + `rounded-full` control in the `Spelare` column.
- 2026-03-03: `/live` now uses `triangle-right.svg` as the inline live-match link icon in the `Spelare` column.
- 2026-03-03: `/live` now shows a trailing inline play icon inside the `Spelare` column that links to `/live-match/:A/:B`, replacing the separate live-match navigation column.
- 2026-03-03: `/live-match` now builds `data` directly once `match` has been validated, removing an unnecessary conditional around the data object.
- 2026-03-03: `/live-match` now returns a dedicated error as soon as no matching live match is found, and separately reports missing SQL player rows.
- 2026-03-03: `/live-match` now names the inline live payload lookup result `match` instead of `liveMatch`.
- 2026-03-03: `/live-match` now performs the live match lookup inline in `fetch()` instead of through a local `findMatch()` helper.
- 2026-03-03: `/live-match` now wraps its page-level fetch errors in `new Error(...)`, and `Content()` renders `error.message`.
- 2026-03-03: `/live-match` no longer returns a separate `isLoading` from `fetch()`; `Content()` now treats `data == null && error == null` as the loading state.
- 2026-03-03: `/live-match` now resolves all page-level error cases inside `fetch()` itself, so `Content()` only handles a single prepared `error` string plus loading/success states.
- 2026-03-03: `/live-match` now assigns `playerA` and `playerB` inline when building `data`, removing temporary local variables.
- 2026-03-03: `/live-match` now combines `liveError` and `playerError` inline in `fetch()`'s return object instead of storing a temporary `combinedError`.
- 2026-03-03: `/live-match` now names the `useRequest()` error value `liveError` inside `fetch()`, clarifying the combined error handling.
- 2026-03-03: `/live-match` `fetch()` now returns a single combined `error` value instead of separate `error` and `playerError`, simplifying `Content()` error handling.
- 2026-03-03: `/live-match` now reads `playerA` and `playerB` directly as the first row from the first and second SQL result sets respectively, removing the temporary `playersById` lookup.
- 2026-03-03: `/live-match` now reads `playerA` and `playerB` directly from the SQL `players` result by route param id, and no longer merges live payload player objects into the card data.
- 2026-03-03: `/live-match` `fetch()` now names the SQL player query result `players` instead of `playerRows`.
- 2026-03-03: `/live-match` now keeps `findMatch()` local inside `fetch()`, reducing file-level helper surface.
- 2026-03-03: `/live-match` `fetch()` now accepts a `refetchInterval` parameter with default `10 * 1000`, and uses it for both live and player polling queries.
- 2026-03-03: `/live-match` now assumes route params `:A/:B` already match the live payload order, so the page no longer applies reverse-order fallback or score inversion.
- 2026-03-03: `/live-match` now refetches live and player data every 10 seconds instead of every 15 seconds.
- 2026-03-03: `/live-match` now renders the `Jämför spelare` button in its own center-column table row, so the side `PlayerCell`s stay vertically centered against the score panel.
- 2026-03-03: `/live-match` `PlayerCell` now centers its avatar/name block vertically within the side table cells.
- 2026-03-03: `/live-match` head-to-head button label now reads `Jämför spelare` instead of `Visa statistik`.
- 2026-03-03: `/live-match` now places the centered `Visa statistik` button directly below the result/ställning panel in the middle column instead of below the full match card.
- 2026-03-03: `/live-match` once again shows a centered `Visa statistik` button below the scoreboard, linking to `/head-to-head/:A/:B`.
- 2026-03-03: `/live-match` now shows `#rank` as plain inline text after the player flag and country code, without a styled badge.
- 2026-03-03: `/live-match` now fetches both route players with `SELECT * FROM players` and merges those rows directly into the live payload, so card metadata like `rank` comes straight from the players table.
- 2026-03-03: `/live-match` now respects route order for `:A/:B`; if the live payload lists the pair in the opposite order, the page swaps the player cards and inverts the displayed score.
- 2026-03-03: `/live-match` now refetches live data every 15 seconds instead of every 30 seconds.
- 2026-03-03: `/live-match` no longer shows the `Visa tidigare möten` button below the scoreboard.
- 2026-03-03: `/live-match` now reads the real `GET /live` payload, matching by route params `:A/:B` and using SQL only to derive local ranking numbers for the two live players.
- 2026-03-02: `/live-match` now renders the `Visa tidigare möten` button below the three-column table instead of inside the center score cell, keeping the side player cards visually centered against the score board.
- 2026-03-02: `/live-match` no longer passes `enabled` to its player lookup query; the page now fully relies on route params `A` and `B` always being present.
- 2026-03-02: `/live-match` no longer keeps a separate file-level refresh interval constant; the 30-second SQL refetch interval is now inlined where the query is configured.
- 2026-03-02: `/live-match` no longer renders the experimental `ProgressBar`; the page was simplified again and now keeps only the 30-second auto-refetch behavior without a visual timer.
- 2026-03-02: `/live-match` again wraps its route params, SQL lookup, and progress calculation in a local `fetch()` helper, while keeping the 30-second auto-refetch behavior.
- 2026-03-02: `/live-match` now auto-refetches its player lookup every 30 seconds; the bottom `ProgressBar` is derived from `dataUpdatedAt` and reaches completion exactly when the next fetch starts.
- 2026-03-02: `/live-match` `ProgressBar` now accepts a `type` prop with `squre` as the default flat-edged variant and `round` as an alternative for circular ticks.
- 2026-03-02: `/live-match` now uses a reusable `ProgressBar` component at the bottom of the page, rendered from a percentage `percent` prop instead of its own timer.
- 2026-03-02: `/live-match` `ProgressBar` is defined as a separate reusable component in the same file instead of nesting it inside the page component.
- 2026-03-02: `/live-match` `ProgressBar` accepts a `ticks` prop to control the number of dots, defaulting to `10`.
- 2026-03-02: `/live-match` `ProgressBar` accepts a `percent` prop and clamps it to the range `0-100`.
- 2026-03-02: `/live-match` mock data now only keeps fields that are still rendered; the unused `round` field was removed.
- 2026-03-02: `/live-match` now keeps `PlayerCell` and `ScoreCell` local to `Component`, reducing file-level API surface before the upcoming live endpoint integration.
- 2026-03-02: `/live-match` player cards now render `#${player.rank}` directly instead of using a local `playerSeed()` helper or seed fallback.
- 2026-03-02: `/live-match` mock data now only keeps static match metadata that is still rendered; mock player objects were removed because fetched `playerA` and `playerB` always replace them.
- 2026-03-02: `/live-match` no longer returns a separate local `isLoading` flag from its fetch helper; the page now treats missing `data` as the loading state.
- 2026-03-02: `/live-match` now builds the head-to-head link inline inside `ScoreCell`, removing an unnecessary local helper.
- 2026-03-02: `/live-match` no longer falls back when route params are missing; the page now expects `A` and `B` and renders a standard error state if either player id is missing or not found.
- 2026-03-02: `/live-match` now assumes fetched players always have ids, so the player card avatar uses the ATP headshot URL directly instead of checking for a missing id fallback helper.
- 2026-03-02: `/live-match` now keeps helper functions local to `PlayerCell` and `ScoreCell` where they are used, simplifying the file-level API surface.
- 2026-03-02: `/live-match` now centers player names within the side cards so multi-line names stay visually centered.
- 2026-03-02: `/live-match` now shows a `Visa tidigare möten` button under the center scoreboard that links to `/head-to-head/:A/:B` when both player ids are available.
- 2026-03-02: `/live-match` no longer uses linear-gradient utility classes in the player card fallback avatars; the page now keeps those surfaces flat and simple.
- 2026-03-02: `/live-match` player cards now align their avatar/flag color treatment more closely with the player page, including `bg-primary-900` behind ATP headshots and `border-current` on flags.
- 2026-03-02: `/live-match` now uses the shared `Avatar` component with ATP headshot URLs for `playerA` and `playerB` when player ids are available, while keeping initials as a fallback.
- 2026-03-02: `/live-match` no longer simulates an extra client-side timeout before rendering; it now resolves immediately from mock fallback or as soon as the SQL player lookup returns.
- 2026-03-02: `/live-match` now fetches `playerA` and `playerB` from the `players` table in one `useSQL` call sequence, using route params `A` and `B` and then mapping those rows into the page state.
- 2026-03-02: `/live-match` now includes a local `fetch()` scaffold that reads route params `A` and `B`, mirroring the basic `/head-to-head` pattern without adding SQL yet.
 - 2026-03-02: The app landing page live-match CTA is now labeled `Följ matchen live`.
- 2026-03-02: The app landing page `Live-match` button now links to `/live-match/:A/:B` using the selected/default player ids, matching the head-to-head style of navigation.
- 2026-03-02: `/live-match` now also accepts route params `:A/:B`, matching the parameter naming used by `/head-to-head/:A/:B`, while keeping the plain `/live-match` route for the static mock page.
- 2026-03-02: `/live-match` now renders the center score panel through a dedicated `ScoreCell` helper for a cleaner component structure.
- 2026-03-02: `/live-match` mock data now names the players `playerA` and `playerB` instead of `leftPlayer` and `rightPlayer`.
- 2026-03-02: `/live-match` mockup now uses `rounded-sm` for the main panel and center score card corners.
- 2026-03-02: `/live-match` mockup no longer uses linear gradient backgrounds in the match panel; the card surfaces are now flat color fills.
- 2026-03-02: `/live-match` no longer shows the extra top metadata row inside the match card; the mockup now relies on the page title plus the core three-column match layout.
- 2026-03-02: `/live-match` no longer shows a separate mock status badge in the header area; the mockup now keeps only event, round, players, and score.
- 2026-03-02: `/live-match` now uses the mock match event name as the page title instead of the generic `Live-match` heading.
- 2026-03-02: `/live-match` mockup now derives the center display from a single compact `score` string in the format `set set set [game-points]`, instead of storing set summary and live points separately.
- 2026-03-02: `/live-match` mockup now shows the played sets as a compact line beneath the large live game score in the center card, replacing the earlier center score table experiment.
- 2026-03-02: `/live-match` mockup now includes played sets in the center scoreboard, showing per-player set scores plus current game points for the static Sinner vs Alcaraz example.
- 2026-03-02: `/live-match` now shows a static three-column table mockup with fixed-width player avatar columns and a centered expanding score column, using a placeholder Sinner vs Alcaraz live state (`40-15`) without fetching data.
- 2026-03-02: Added a placeholder `/live-match` page with the standard page shell and title only, plus a button on the app landing page that links to it.
- 2026-03-01: Synced the frontend and schema source of truth with the latest database function rename. Queries now use `NUMBER_OF_GAMES`/`NUMBER_OF_SETS`, `sp_update_match_status` uses the new `NUMBER_OF_SETS(score)` signature, and `schema.sql` restores compatibility helpers plus `IS_MATCH_COMPLETED` so the dump remains runnable.
- 2026-02-28: Renamed the `/query/monthly-salary-indexed` query title to `Månadslön för en tennisspelare genom tiderna`.
- 2026-02-28: Renamed the `/query/monthly-salary-indexed` salary output column to `Månadslön (indexreglerad)` and kept the original query title.
- 2026-02-28: `/query/monthly-salary-indexed` now renders year fields without Swedish thousands separators.
- 2026-02-28: Added `/query/monthly-salary-indexed`, a CPI-adjusted monthly salary estimate based on each player's career prize money and career midpoint year; year fields are emitted as text to avoid numeric formatting, and at least 5 active years are required.
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

`/`, `/app`, `/player/:id`, `/head-to-head/:A/:B`, `/event/:id`, `/ranking`, `/events`, `/players`, `/live`, `/live-match`, `/log`, `/trial`, `/qna`, `/settings`, `/query/:name`, `/currently`, `/abc`, `/not-found`, and fallback `*` -> `NotFound`.

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
`best-form`, `biggest-upsets`, `decenial-slams`, `longest-matches-ever`, `match-turn-arounds`, `monthly-salary-indexed`, `prize-money`, `prospects`, `ranking-climbers`, `titles-under-age-21`, `top-10-players`, `top-50-dropouts`, `underranked-players`, `who-is-the-goat`.

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
