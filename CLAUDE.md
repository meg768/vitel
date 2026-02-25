# Vitel — Claude-kontext

## Vad är projektet?
React-app för ATP-tennisstatistik. Driftsätts via `npm run upload` (Vite build + scp till `router.egelberg.se`).

## Stack
- React 19, Vite, Tailwind CSS v4, Radix UI, React Query, Recharts
- Router: React Router v7 (HashRouter)
- Backend: MySQL via eget API (`src/js/service.js`)

## Viktiga filer
- `src/index.jsx` — Entry point och router-definition
- `src/pages/app/index.jsx` — Startsida
- `src/js/vitel.js` — Exporterar `service`, `useSQL`, `useRequest`
- `src/js/service.js` — API-anrop mot backend
- `src/js/queries.js` — Laddar SQL-filer via `import.meta.glob('../queries/*.sql')`
- `src/queries/*.sql` — Fördefinierade SQL-frågor (laddas automatiskt)

## Sidor (routes)
`/`, `/app`, `/player/:id`, `/head-to-head/:A/:B`, `/event/:id`, `/ranking`,
`/events`, `/players`, `/live`, `/log`, `/trial`, `/qna`, `/settings`, `/chat`,
`/ask-bob`, `/query/:name`, `/currently`, `/not-found`

## Komponenter — viktiga detaljer
- `src/components/ui/link.jsx` — prop `hover={bool}` styr opacity-hover. Använd `className='block'` för att göra hela raden klickbar.
- `src/components/ui/markdown.jsx` — använder Tailwind `prose` med `prose-p:my-1 prose-li:my-0` för tätare radavstånd.
- `src/components/page.jsx` — sidlayout med `Page`, `Page.Menu`, `Page.Content`, `Page.Container`, `Page.Title`, `Page.Loading`, `Page.Error`.

## SQL-filer (src/queries/*.sql)
Varje fil har ett huvud-kommentarblock med metadata:
```sql
/*
@title
Titel visas i UI

@description
Beskrivning renderas som **Markdown**.
*/
```
Filen laddas automatiskt in i appen via `import.meta.glob`. Filnamnet (utan .sql) används som URL-id på `/query/:name`.

Befintliga filer: `biggest-upsets`, `best-form`, `decenial-slams`, `longest-matches-ever`,
`match-turn-arounds`, `prize-money`, `prospects`, `ranking-climbers`, `titles-under-age-21`,
`top-10-players`, `top-50-dropouts`, `underranked-players`, `who-is-the-goat`

## Databas

### Tabeller
**`players`** — Spelardata: id, name, country, age, birthdate, pro, active, height, weight, rank, highest_rank, highest_rank_date, career_wins/losses/titles/prize, ytd_wins/losses/titles/prize, coach, points, serve_rating, return_rating, pressure_rating, elo_rank, elo_rank_clay/grass/hard, hard_factor/clay_factor/grass_factor (0–100, senaste 2 år), url, image_url

**`matches`** — id, event (FK), round ('F','SF','QF','R16','R32','R64','R128'), winner (FK), loser (FK), winner_rank, loser_rank (rank vid matchtillfället), score ('76(5) 36 63 64'), status ('Completed','Aborted','Walkover','Unknown'), duration ('HH:MM')

**`events`** — id, date, name, location, type ('Grand Slam','Masters','ATP-500','ATP-250'), surface ('Hard','Clay','Grass'), url

**`queries`**, **`log`**, **`settings`**, **`storage`** — hjälptabeller

### Vy: `flatly`
Denormaliserad join av matches + players (winner=A, loser=B) + events (C).
Kolumner: id, event_date, event_id, event_name, event_location, event_type, event_surface, round, winner, loser, winner_id, winner_rank, loser_id, loser_rank, score, status, duration

### Databasfunktioner
- `IS_MATCH_COMPLETED(score)` → TINYINT
- `NUMBER_OF_SETS_PLAYED(score)` → INT
- `NUMBER_OF_GAMES_PLAYED(score)` → INT
- `NUMBER_OF_MINUTES_PLAYED(duration)` → INT (HH:MM → minuter)
- `NUMBER_OF_SETS(event_type, round)` → INT (5 för Grand Slam main draw, annars 3)
- `NUMBER_OF_TIEBREAKS_PLAYED(score)` → INT

### Stored procedures
- `sp_update()` — kör alla uppdateringar efter dataimport
- `sp_update_match_status(force BOOLEAN)`
- `sp_update_match_duration()`
- `sp_update_surface_factors()` / `sp_update_surface_factors_for_player(id)`
