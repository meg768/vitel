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

## Key Paths
- App bootstrap and routes: `src/index.jsx`
- API service wrapper: `src/js/service.js`
- Query hooks: `src/js/vitel.js`
- SQL query file loader: `src/js/queries.js`
- Database schema (source of truth): `src/database/schema.sql`
- Markdown UI component: `src/components/ui/markdown.jsx`

## Database Schema
- Source of truth: `src/database/schema.sql` (always read current file contents).

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
- Removed unused import specifiers/redundant import declarations across the codebase (including `src`, `utilities`, and generated JSX icon components under `src/assets/CCCradix-icons-jsx`).
- Normalized `.jsx` import spacing so there is never more than one blank line between consecutive import statements.
- Sorted `.jsx` imports with this order:
  - external modules first
  - then internal imports sorted by source folder/path
- Removed Bob assistant from frontend:
  - Removed routes `/ask-bob` and `/chat` from `src/index.jsx`
  - Deleted `src/pages/ask-bob/index.jsx`
  - Deleted `src/pages/chat/index.jsx` and `src/pages/chat/index.css`
  - Removed "Fråga Bob" button from `src/pages/app/index.jsx`
- Database structure moved to separate file:
  - `src/database/schema.sql`
- Simplified `## Database Schema` in `AGENTS.md` to a single reference to `src/database/schema.sql`.

## Working Notes
- README is minimal (`README.md` contains only `# vite`).
- Local worktree currently has many uncommitted changes.
