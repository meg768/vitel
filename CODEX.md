# CODEX

Den här filen är den kanoniska, versionsstyrda minnesfilen för `vitel`.

## Regler

- All versionsstyrd projektkontext och allt löpande projektminne sparas här i `CODEX.md`.
- `AUTHOR.md` är fortsatt en lokal, personlig fil och ska inte lagras i GitHub.
- `CODEX.md` är den enda versionsstyrda minnesfilen för projektet.
- Lägg nya uppdateringar längst upp i `## Ändringslogg`.

## Projektöversikt

`vitel` är en React-baserad webbapp för ATP-tennisstatistik, livebevakning och oddsöversikter. Frontenden är statiskt serverad och hämtar data från ett backend-API.

Nuvarande huvudbild:

- Frontend: React 19, Vite 6, Tailwind CSS v4
- Routing: `HashRouter`
- Data/cache: TanStack Query
- Backend-bas: `VITE_API_URL`
- Backendkontrakt som används i frontenden: `GET /live`, `GET /oddset`, `POST /query`
- Databasschema source of truth: `src/database/schema.sql`
- Backendrepo: `meg768/atp-tennis`

## Nuvarande produktbild

Appen fokuserar just nu på:

- spelarsidor och ranking
- turneringar och event
- live- och nyligen avslutade matcher
- detaljerad scoreboardvy
- SQL-drivna query-sidor
- Q&A och enklare drift/debug via settings/log

Nuvarande spelartitlar:

- `src/components/player-title.jsx` är den gemensamma titeln för spelare
- används både på `/player/:id` och i spelarsektionerna på `/head-to-head/:A/:B`
- visar flagga, namn, land och en Wikipedia-knapp när `players.wikipedia` är satt och inte är tom

Nuvarande huvudsidor i routing:

- `/` och `/app`
- `/player/:id`
- `/head-to-head/:A/:B`
- `/event/:id`
- `/ranking`
- `/events`
- `/players`
- `/live`
- `/oddset`
- `/matches`
- `/scoreboard`
- `/scoreboard/:A/:B`
- `/log`
- `/qna`
- `/settings`
- `/query/:name`
- `/not-found`

Bakåtkompatibla redirects som fortfarande finns:

- `/live-matches-overview` -> `/matches`
- `/live-matches-detail` -> `/scoreboard`
- `/live-matches-detail/:A/:B` -> `/scoreboard/:A/:B`

Nuvarande toppmeny:

- ATP-logga till startsidan
- `Spelare`
- `Turneringar`
- `Matcher`
- `Q&A`
- inställningsikon

Rollfördelning mellan matchsidorna:

- `/matches` är den kompakta översikten för pågående, nyligen avslutade och kommande matcher
- `/scoreboard` är den mer detaljerade live-monitorn
- `/oddset` finns kvar som egen route
- `/live` finns kvar som ATP-livevy

## Körning

Installera och kör lokalt:

```bash
npm install
npm run run
```

Miljövariabel:

```bash
VITE_API_URL=http://localhost:3004/api
```

Viktiga scripts i `package.json`:

- `npm run run`
- `npm run build`
- `npm run preview`
- `npm run git-backup`
- `npm run git-commit`
- `npm run git-delete-backup`
- `npm run git-restore`
- `npm run upload`
- `npm run "goto GitHub"`

## Viktiga filer

- `src/index.jsx` - bootstrap, tema, routing
- `src/components/menu.jsx` - toppmeny
- `src/pages/app/index.jsx` - startsida
- `src/pages/live/index.jsx` - ATP live-lista
- `src/pages/oddset/index.jsx` - Oddset-sida
- `src/pages/matches/index.jsx` - kompakt matchöversikt
- `src/pages/scoreboard/index.jsx` - detaljerad live monitor
- `src/pages/query/index.jsx` - SQL-querysida
- `src/components/player-title.jsx` - gemensam spelartitel för spelarsidor och head-to-head
- `src/js/service.js` - låg nivå för API-anrop
- `src/js/vitel.js` - `service`, `useRequest`, `useSQL`
- `src/js/queries.js` - laddar `src/queries/*.sql`
- `src/js/live-oddset.js` - delad logik för liveodds
- `src/database/schema.sql` - databasschema, views, funktioner och procedurer
- `src/components/ui/markdown.jsx` - markdownrendering i UI

Kataloger som fortfarande finns i `src/pages/` men inte är aktiva routes i `src/index.jsx`:

- `src/pages/calendar`
- `src/pages/more`
- `src/pages/plj`
- de ska behandlas som historiska/inaktiva tills de uttryckligen tas i bruk igen

## Query-system

SQL-filer i `src/queries/*.sql` laddas via `import.meta.glob` och används på `/query/:name`.

- filnamnet utan `.sql` blir route-id
- metadata kan ligga i första kommentarblocket
- stödda metadatafält är i praktiken `@title` och `@description`

Exempel:

```sql
/*
@title
Titel

@description
Markdown-beskrivning
*/
```

Nuvarande query-filer:

- `best-form`
- `biggest-upsets`
- `decenial-slams`
- `longest-matches-ever`
- `match-turn-arounds`
- `monthly-salary-indexed`
- `prize-money`
- `prospects`
- `ranking-climbers`
- `titles-under-age-21`
- `top-10-players`
- `top-50-dropouts`
- `underranked-players`
- `who-is-the-goat`

## Databasbild

Kärntabeller:

- `players`
- `matches`
- `events`
- `log`
- `settings`

Viktiga views:

- `flatly`

Exempel på procedurer/funktioner som återkommer i projektet:

- `NUMBER_OF_GAMES`
- `NUMBER_OF_SETS`
- `NUMBER_OF_TIE_BREAKS`

Viktigt om `players`:

- kolumnen `wikipedia` används i UI:t för att visa en Wikipedia-knapp i den gemensamma `PlayerTitle`-komponenten
- knappen visas bara när värdet inte är `NULL` och inte är en tom sträng

## Arbetsminne

Det som är viktigt att komma ihåg framåt:

- Backend `GET /oddset` är den tänkta källan för odds i UI:t.
- `/matches` och `/scoreboard` är de namn som gäller nu; äldre `live-matches-*` lever bara som redirects.
- Det finns fortfarande några äldre sidkataloger kvar i trädet, men de är inte del av den aktiva routingen.
- Menyn är medvetet kort och ska hållas enkel.
- `AUTHOR.md` ska inte återintroduceras i Git eller blandas in i versionsstyrd projektkontext.
- Lokal `AUTHOR.md` kan vara en symlink till `~/.codex/shared/AUTHOR.md` för att dela samma personliga utvecklarkontext mellan flera projekt.
- Om ny projektkunskap uppstår ska den läggas här i stället för att splittras över flera minnesfiler.

## Ändringslogg

- 2026-03-20: `README.md` synkades med `package.json` så att scriptlistan nu dokumenterar `git-backup`, `git-commit`, `git-delete-backup` och `git-restore` i stället för gamla `commit`/`revert`.
- 2026-03-20: `CODEX.md` uppdaterades efter ny genomläsning av projektet. Det dokumenterades uttryckligen att `src/pages/calendar`, `src/pages/more` och `src/pages/plj` fortfarande ligger kvar i trädet men inte är aktiva routes i `src/index.jsx`.
- 2026-03-19: `README.md` och `CODEX.md` uppdaterades för den nya gemensamma `src/components/player-title.jsx` och för att dokumentera att `players.wikipedia` nu används i UI:t på `/player/:id` och `/head-to-head/:A/:B`.
- 2026-03-19: `CODEX.md` synkades med uppdaterat `src/database/schema.sql`. Gamla tabeller/views/procedurer som inte längre finns i schemat togs bort ur databasöversikten och funktionsnamnen justerades till `NUMBER_OF_GAMES`, `NUMBER_OF_SETS` och `NUMBER_OF_TIE_BREAKS`.
- 2026-03-18: `package.json` uppdaterades med git-skripten `git-backup`, `git-commit`, `git-delete-backup` och `git-restore` för att matcha delad personlig workflow i `AUTHOR.md`.
- 2026-03-18: Bekräftade att `AUTHOR.md` nu delas mellan flera projekt via symlink till `~/.codex/shared/AUTHOR.md`. Detta är den föredragna modellen för personlig, icke versionsstyrd utvecklarkontext.
- 2026-03-18: Konsoliderade versionsstyrt projektminne till `CODEX.md`. `AUTHOR.md` lämnas kvar som lokal personlig fil som inte ska versionsstyras.
- 2026-03-18: `/matches` och gemensamma informationslägen finputsades vidare. Fokus låg på sektionen `Nyligen avslutade`, spacing mellan sektioner och att använda lättare informationspresentation via emoji-/info-komponenter.
- 2026-03-17: `/matches` blev den tydliga matchöversikten med pågående, nyligen avslutade och kommande matcher. `Tidigare möten` lades till i avslutade matcher, scoreboardlänk/spacings rytmades ut, oddsfotnoten förtydligades och gammal `calendar`-funktionalitet togs bort.
- 2026-03-17: Live monitor-detaljsidan bytte permanent namn från äldre `live-matches-detail` till `/scoreboard`, med kompatibilitetsredirect kvar.
- 2026-03-16: Den äldre `live-matches-overview` konsoliderades till `/matches`. Perioden innehöll också experiment med mellanliggande navigationssidor (`/more`, kalender, extra menystruktur), men slutläget är en kortare toppmeny utan dessa sidospår.
- 2026-03-16: `Page.Emoji` etablerades som gemensamt tomt läge för flera sidor, bland annat `/live`, `/oddset`, `/matches` och `/not-found`.
- 2026-03-15: `/calendar` byggdes ut med loggor, badges och backenddriven eventdata, men togs sedan helt bort ur produkten dagen efter. Historiskt visar det att UI-riktningen testas snabbt och rensas bort när den inte längre behövs.
- 2026-03-14 till 2026-03-17: `/oddset`, `/matches`, `/live` och menyetiketter växlade flera gånger medan informationsarkitekturen sattes. Slutläget nu är att `Matcher` pekar på `/matches`, `Oddset` finns som separat route och `/live` finns kvar som ATP-livevy.
- 2026-03-12: `README.md` skrevs om till publik GitHub-form, backendrepot `meg768/atp-tennis` dokumenterades tydligare och frontendens beroende av `GET /oddset`, `GET /live` och `POST /query` skärptes.
- 2026-03-12: `trial/` avvecklades ur repot. Under samma period gjordes flera steg i Oddset-pipelinen: först isolering och återbruk av hjälpkod, sedan återgång till enklare och mer lokal logik när experimenten inte längre behövdes.
- 2026-03-11: Oddsetflödet utvecklades kraftigt. Det inkluderade klassbaserad hämtning, delad pipeline, matchning mot spelare/ranking samt flera justeringar i hur `/oddset` och senare `/matches` grupperade live/kommande matcher.
- 2026-03-11: Temasystemet standardiserades kring `auto auto`, och äldre localStorage-nycklar migrerades till namnområdet `vitel`.
- 2026-03-10: `/oddset` växte från enkel listning till en mer levande sida med odds, live/kommande-sektioner, countdown och länkar vidare till liveövervakning.
- 2026-03-09 till 2026-03-10: Live-odds integrerades i `/live` och live-monitorer, en gemensam `Countdown`-komponent infördes och `/live-matches` fick återkommande UI- och typografiarbete för att fungera som dashboard.
- 2026-03-07 till 2026-03-09: Den dåvarande `/live-match`-sidan utvecklades snabbt till en full monitor med fokusläge, live score-panel, head-to-head-länkar, stora typografiexperiment och senare flera dashboard-/grid-/listlayouter. Detta är grunden till dagens `/scoreboard`.
- 2026-03-07: Historisk logg konsoliderades senare vidare till den samlade minnesfilen `CODEX.md`.
- 2026-03-06: `AUTHOR.md` markerades uttryckligen som lokal och ignorerad i Git, vilket fortfarande gäller.
- 2026-03-04 till 2026-03-05: `/live-match` fick omfattande arbete kring scoreboard-layout, serve-indikator, kommentarplacering, typografi, overflow och mobilanpassning.
- 2026-03-03 till 2026-03-04: `/live` experimenterade med regelbaserade varnings-/pingflöden via filer i `src/pages/live/…`, inklusive genererade regler, README-styrning och dynamisk inladdning. Det visar att projektet tillåter lokala, filbaserade mini-DSL:er när det hjälper arbetsflödet.
- 2026-03-03: `/players` och `/ranking` förfinades, bland annat med ranking först och land inline i namnkolumnen.
- 2026-03-02 till 2026-03-03: Första generationen av live-monitor byggdes, med trekolumnslayout, spelaruppslag via SQL, route-parametrar `:A/:B`, head-to-head-länk och senare verklig koppling till `GET /live`.
- 2026-03-01: Frontend och `schema.sql` synkades med databasfunktioner som `NUMBER_OF_GAMES`, `NUMBER_OF_SETS` och `IS_MATCH_COMPLETED`.
- 2026-02-28: Queryn `monthly-salary-indexed` lades till och finputsades.
- 2026-02-27: `/live` fick auto-refresh, countdown samt `Tidigare möten`.
- 2026-02-26: `/live`-grupperingen stabiliserades så att status från backend styr visningen av pågående/slutförda matcher.
