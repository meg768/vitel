# Agent Instructions And Project Memory

Updated: 2026-02-25

## How To Use This File
- Always read this file at the start of each new session.
- Treat this file as the canonical long-term context for this repository.
- When a task is completed, update this file with concise, factual changes.

## Memory Update Rules
- Keep entries short and practical.
- Prefer concrete paths, commands, and decisions over long prose.
- Keep only information that will help future sessions move faster.

## User Preferences
- Keep existing comments when refactoring code.
- Prefer multiple `clsx()` calls over one long `clsx()` call in the markdown UI component.
- Communicate in Swedish when user writes Swedish.

## Project Overview
- Stack: React 19 + Vite 6 + Tailwind CSS v4 + React Router + TanStack Query.
- Entry/routing: `src/index.jsx` with `HashRouter`.
- Backend base URL via `VITE_API_URL`.
- Main data API usage:
  - SQL-like endpoint: `/query` via `src/js/service.js` and `src/js/vitel.js`.
  - Chat endpoint: `/chat` used by pages such as `src/pages/chat/index.jsx`.

## Key Paths
- App bootstrap and routes: `src/index.jsx`
- API service wrapper: `src/js/service.js`
- Query hooks: `src/js/vitel.js`
- SQL query file loader: `src/js/queries.js`
- Markdown UI component: `src/components/ui/markdown.jsx`

## Database Schema
- Source of truth: user-provided MySQL DDL (2026-02-25).
- Tables:
  - `players`
  - `matches`
  - `events`
  - `log`
- Views:
  - `flatly` (joined match/event/player analysis view)
  - `currently` (ongoing events and alive players in main draw)
- Key relationships:
  - `matches.event -> events.id`
  - `matches.winner -> players.id`
  - `matches.loser -> players.id`
- Important `players` columns:
  - `id`, `name`, `country`, `age`, `birthdate`, `active`, `rank`, `highest_rank`, `highest_rank_date`
  - `career_wins`, `career_losses`, `career_titles`, `career_prize`
  - `ytd_wins`, `ytd_losses`, `ytd_titles`, `ytd_prize`
  - `serve_rating`, `return_rating`, `pressure_rating`
  - `elo_rank`, `elo_rank_clay`, `elo_rank_grass`, `elo_rank_hard`
  - `hard_factor`, `clay_factor`, `grass_factor`
- Important `matches` columns:
  - `id`, `event`, `round`, `winner`, `loser`, `winner_rank`, `loser_rank`, `score`, `status`, `duration`
- Important `events` columns:
  - `id`, `date`, `name`, `location`, `type`, `surface`, `url`
- Functions:
  - `IS_MATCH_COMPLETED`
  - `NUMBER_OF_GAMES_PLAYED`
  - `NUMBER_OF_MINUTES_PLAYED`
  - `NUMBER_OF_SETS`
  - `NUMBER_OF_SETS_PLAYED`
  - `NUMBER_OF_TIEBREAKS_PLAYED`
- Procedures:
  - `sp_log`
  - `sp_update`
  - `sp_update_match_duration`
  - `sp_update_match_status`
  - `sp_update_surface_factors`
  - `sp_update_surface_factors_for_player`

## Recent Changes
- `src/components/ui/markdown.jsx`:
  - Kept existing comment block.
  - Refactored class assembly to use multiple `clsx()` calls (more granular chaining).
- Memory system:
  - Consolidated instructions + memory into this single `AGENTS.md`.
  - Removed separate `PROJECT_MEMORY.md`.
- Added `Database Schema` section in `AGENTS.md` based on provided DDL.
- Removed duplicate copy files:
  - `src/pages/qna/index copy.jsx`
  - `vite.config copy.js`
  - `tailwind.config copy.js`
- Added a new page scaffold:
  - `src/pages/abc/index.jsx`
  - Route added in `src/index.jsx` at path `/abc`
- Removed commented-out import lines in:
  - `src/pages/app/index.jsx`
  - `src/components/ui/table.jsx`
  - `utilities/fetch-flags.js`

## Working Notes
- README is minimal (`README.md` contains only `# vite`).
- Local uncommitted changes currently include `src/components/ui/markdown.jsx`.
