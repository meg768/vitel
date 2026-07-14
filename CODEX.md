# CODEX

Den här filen är den kanoniska, versionsstyrda minnesfilen för `vitel`.

## Regler

- All versionsstyrd projektkontext och allt löpande projektminne sparas här i `CODEX.md`.
- `AUTHOR.md` är fortsatt en lokal, personlig fil och ska inte lagras i GitHub.
- `CODEX.md` är den enda versionsstyrda minnesfilen för projektet.
- Lägg nya uppdateringar längst upp i `## Ändringslogg`.
- Efter varje färdig kod- eller designändring ska Vitel byggas och laddas upp till produktion med `npm run upload`, om Magnus inte uttryckligen säger något annat.

## Projektöversikt

`vitel` är en React-baserad webbapp för ATP-tennisstatistik, livebevakning och oddsöversikter. Frontenden är statiskt serverad och hämtar data från ett backend-API.

Nuvarande huvudbild:

- Frontend: React 19, Vite 6, Tailwind CSS v4
- Routing: `HashRouter`
- Data/cache: TanStack Query
- Backend-bas: `VITE_API_URL`
- Production API URL: `https://tennis.egelberg.se/api`
- Production static root: `/var/www/html/vitel` on `pi-kato`
- Apache on `tennis.egelberg.se` serves the static frontend and reverse proxies
  `/api` to `http://localhost:3004/api`
- Backendkontrakt som används i frontenden: `GET /live`, `GET /oddset`, `POST /query`
- Databasschema source of truth: `src/database/schema.sql`
- Backendrepo: `meg768/atp-tennis`
- Lokal backend i utveckling ligger i syskonmappen `../atp-tennis`
- MCP-bryggan ligger i syskonmappen `../atp-tennis-mcp`
- Oddset ska betraktas som backendägt: frontend får inte hämta Oddset/Kambi direkt utan ska gå via backendens `GET /api/oddset`
- Den här Codex-tråden används nu som huvudkonversation för `vitel`, `atp-tennis` och `atp-tennis-mcp`, så sammanhängande ändringar kan koordineras i ett och samma samtal.

## Nuvarande produktbild

Appen fokuserar just nu på:

- spelarsidor och head-to-head
- turneringar och event
- live- och nyligen avslutade matcher
- detaljerad scoreboardvy
- SQL-drivna query-sidor
- Q&A, testsida samt enklare drift/debug via settings/log

Nuvarande spelartitlar:

- `src/components/player-title.jsx` är den gemensamma titeln för spelare
- används både på `/player/:id` och i spelarsektionerna på `/head-to-head/:A/:B`
- visar flagga, namn, land och en Wikipedia-knapp när `players.wikipedia` är satt och inte är tom

Nuvarande head-to-head-fördjupning:

- `/head-to-head/:A/:B` hålls lätt och fokuserar på översikt
- `/head-to-head-details/:A/:B` är den separata fördjupningssidan för jämförande frågor mellan två spelare
- detaljsidan är SQL-driven och bygger en enda trekolumnstabell via `src/components/ui/data-table.jsx`
- frågorna ligger lokalt i `src/pages/head-to-head-details/queries/*.sql` och laddas av en lokal loader

Nuvarande huvudsidor i routing:

- `/`
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
- inställningsikon längst till höger

Rollfördelning mellan matchsidorna:

- `/matches` är den kompakta översikten för pågående, nyligen avslutade och kommande matcher
- `/scoreboard` är den mer detaljerade live-monitorn
- `/oddset` finns kvar som egen route
- `/live` finns kvar som ATP-livevy
- `/trial` är en aktiv, intern testsida för snabba UI-/komponentexperiment

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

`npm run upload` builds the frontend and uploads `dist/*` to
`root@pi-kato:/var/www/html/vitel`.

## Viktiga filer

- `src/index.jsx` - bootstrap, tema, routing
- `src/components/menu.jsx` - toppmeny
- `src/pages/app/index.jsx` - startsida
- `src/pages/live/index.jsx` - ATP live-lista
- `src/pages/oddset/index.jsx` - Oddset-sida
- `src/pages/matches/index.jsx` - kompakt matchöversikt
- `src/pages/scoreboard/index.jsx` - detaljerad live monitor
- `src/pages/head-to-head-details/index.jsx` - SQL-driven head-to-head-sida med jämförande frågor
- `src/pages/head-to-head-details/queries.js` - laddar och kompilerar lokala frågor för head-to-head-detaljsidan
- `src/pages/query/index.jsx` - SQL-querysida
- `src/pages/players/index.jsx` - rankinglista med integrerad spelarsökning i sidtiteln
- `src/pages/trial/index.jsx` - intern testsida för UI-/komponentexperiment
- `src/components/player-title.jsx` - gemensam spelartitel för spelarsidor och head-to-head
- `src/js/service.js` - låg nivå för API-anrop
- `src/js/vitel.js` - `service`, `useRequest`, `useSQL`
- `src/js/queries.js` - laddar `src/queries/*.sql`
- `src/js/oddset-pipeline.js` - delad logik för Oddset/live-odds
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

Separata head-to-head-frågor:

- SQL-filer i `src/pages/head-to-head-details/queries/*.sql` används bara på `/head-to-head-details/:A/:B`
- varje fil motsvarar exakt en rad i detaljtabellen
- `@title` blir kolumnen `Fråga`
- SQL returnerar exakt en rad med kolumnerna `player_a_value` och `player_b_value`
- filordningen styrs av filnamnsprefix som `10-...`, `20-...`
- plats­hållarna `:playerA` och `:playerB` kompileras till `?` i `src/pages/head-to-head-details/queries.js`

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
- Liveodds i `/matches` och `/scoreboard` hämtas också via backendens `GET /oddset`, och filtreras på `state === 'STARTED'` i frontend.
- `/matches` och `/scoreboard` är de namn som gäller nu; äldre `live-matches-*` lever bara som redirects.
- `/ranking` är borttagen som egen sida och route; ranking används fortfarande som data i flera vyer men inte som separat destinationssida.
- Spelarsökningen är integrerad i `/players`; den gamla separata `/search`-sidan och dess lokala sökhistorik är borttagna.
- `/trial` ska betraktas som en aktiv intern testsida och får finnas kvar även om den inte är produktnavigation för slutanvändare.
- Det finns fortfarande några äldre sidkataloger kvar i trädet, men de är inte del av den aktiva routingen.
- Menyn är medvetet kort och ska hållas enkel.
- Spelaruppslag i den kringliggande backend/MCP-kedjan håller på att flyttas från gamla `/api/search-player` till nya `/api/player/search` och `/api/player/lookup`.
- `AUTHOR.md` ska inte återintroduceras i Git eller blandas in i versionsstyrd projektkontext.
- Lokal `AUTHOR.md` kan vara en symlink till `~/.codex/shared/AUTHOR.md` för att dela samma personliga utvecklarkontext mellan flera projekt.
- Om ny projektkunskap uppstår ska den läggas här i stället för att splittras över flera minnesfiler.

## Ändringslogg

- 2026-07-14: `/matches` konsumerar det nya modellbaserade oddsformatet från `atp-service`: `odds.TA` och `odds.GPT`. Interna rader använder nu samma korta modellnamn; visning och positiv edge-markering är oförändrade.

- 2026-07-14: Favoritfiltrets stjärna har flyttats ut ur sökfältet och ligger nu med rund border direkt efter sidrubriken `Spelare`. Sökfältet innehåller åter endast sökikon, text och rensningskryss.

- 2026-07-14: Favoritfiltrets stjärna ligger nu inne i sökfältets vänstra del, direkt efter sökikonen och före texten. Rensningskrysset ligger åter längst till höger.

- 2026-07-14: Favoritfiltrets stjärna på `/players` ligger nu utan egen border inne i sökfältets högra kant. Sökfältet reserverar plats för ikonen och rensningskrysset flyttas åt vänster när söktext finns.

- 2026-07-14: Stjärnknappen för favoritfiltret på `/players` ligger nu till höger om sökfältet.

- 2026-07-14: Favoriter har återinförts som ett integrerat filter i stället för en separat sida. Spelarprofilens lokalt sparade stjärna är tillbaka och `/players` har en stjärnknapp bredvid sökfältet som växlar mellan alla spelare och favoriter. Favoritläget lagras som `favorites=1` i URL:en, sökning sker inom aktivt läge och statusbar/tomläge beskriver resultatet.

- 2026-07-14: Den debouncade spelarsökningen sparas nu som `search` i `/players` URL med `replace`, så ett profilbesök följt av Browser Back återställer både söktext och träfflista utan att varje tangenttryckning fyller historiken.

- 2026-07-14: Jämförelserutan på `/players` har fått ett litet kryss längst till höger. Det rensar hela spelarurvalet, återfokuserar sökfältet och låter rutan animeras ihop.

- 2026-07-14: Jämförelserutans höjdanimation använder nu en symmetrisk CSS-gridövergång mellan `0fr` och `1fr` med `ease-in-out`. Det ersätter `max-height`, som gjorde öppningen synligt snabbare än stängningen eftersom maxhöjden översteg innehållets faktiska höjd.

- 2026-07-14: Jämförelserutans öppnings- och stängningsanimation har saktats ned från 200 till 350 ms för en tydligare och lugnare övergång.

- 2026-07-14: Jämförelserutan renderas nu som stabilt innehåll i `/players` i stället för som en ommonterad lokal komponent. Därmed kan webbläsaren faktiskt interpolera dess höjd, opacitet och position när rutan öppnas och stängs.

- 2026-07-14: Jämförelserutan på `/players` är nu dold tills första spelaren väljs via stapelikonen. Den fälls diskret ned med 200 ms toning och en liten vertikal rörelse, och animeras bort när sista valet tas bort.

- 2026-07-14: Favoritfunktionen har tagits bort helt eftersom snabbjämförelsen nu täcker behovet: menypost, `/favorites`-route och sida samt stjärna och lokal favoritlagring på spelarprofilen är borttagna.

- 2026-07-14: Pågående spelarval för jämförelse sparas nu i `sessionStorage`. Valen återställs därför även när användaren navigerar bort och senare öppnar `Spelare` via menyn; URL-parametern används fortsatt för historik och delbar navigering.

- 2026-07-14: När en spelare läggs till för jämförelse töms och fokuseras sökfältet fortfarande, men den aktuella träfflistan ligger kvar tills nästa sökning skrivs. Topp-100 visas därför inte kortvarigt mellan de två spelarvalen.

- 2026-07-14: `Jämför`-pillen har fått mer horisontellt utrymme runt texten (`px-4`) utan att ändra den gemensamma höjden med spelarchipsen.

- 2026-07-14: Spelarchipsen och `Jämför`-pillen i spelarurvalet har nu samma explicita höjd på `2rem`; knappens mindre versaltext behålls.

- 2026-07-14: Texten i den kompakta `Jämför`-pillen använder åter knappens mindre standardstorlek, medan pillmått och versaler behålls.

- 2026-07-14: Den kompakta `Jämför`-pillen i spelarurvalet behåller knappens versaler och typografiska knappstil, men har fortsatt samma höjd och padding som spelarchipsen.

- 2026-07-14: `Jämför`-knappen i spelarurvalet använder nu samma pillstorlek som spelarchipsen: `px-2.5`, `py-1`, normal textstorlek, normal vikt och normal skiftläge. Färg och disabled-beteende behålls.

- 2026-07-14: Disabled och enabled `Jämför` ligger nu på samma inlineposition efter spelarvalen. `ml-auto` togs bort eftersom enabled-knappens länk-wrapper och disabled-knappens direkta flexplacering annars gav olika positioner.

- 2026-07-14: Knappen `Jämför` visas nu redan när en spelare är vald på `/players`, men är inaktiverad tills spelare två har valts. Tomläget visar fortsatt endast instruktionen.

- 2026-07-14: Jämförelsepanelen på `/players` har nu en stabil minsta höjd på `3.5rem`, så tominstruktion, namnchips och den villkorliga `Jämför`-knappen inte får panelen att hoppa vertikalt. Panelen kan fortfarande växa vid radbrytning på smala skärmar.

- 2026-07-14: Jämförelsepanelen på `/players` använder instruktionen `Klicka på [stapelikon] för att jämföra två spelare` som tomläge. Instruktionen ersätts av namnchips när spelare väljs, och först när två är valda visas den högersställda knappen `Jämför`. Ingen automatisk navigering sker.

- 2026-07-14: Flimmer efter jämförelseval på `/players` minskades. Den klickade spelarens data läggs omedelbart i en lokal cache så namnchipset inte väntar på URL-baserad återhämtning, och återgång från sökresultat till standardlistan väntar upp till 900 ms medan nästa namn börjar skrivas. Icke-tomma sökningar använder fortsatt 350 ms debounce.

- 2026-07-14: Snabbjämförelsen på `/players` väljs nu via samma lilla stapelikon som används för jämförelse på `/matches`, inte genom radklick. Spelarnamnet har därmed entydigt beteende och öppnar alltid profilen. Valda spelar-id:n sparas i URL-parametern `compare`, så profilnavigering följd av browser-Back återställer jämförelseurvalet.

- 2026-07-13: `/players` fick ett snabbt tvåspelarflöde för jämförelse. Ett radklick väljer spelaren, tömmer sökningen och återfokuserar fältet; nästa sökning kan därför skrivas direkt. Två val visas som borttagbara namnchips ovanför tabellen och aktiverar `Jämför spelare`, medan ett tredje val ersätter det äldsta. Klick på spelarens namnlänk öppnar fortfarande profilen utan att välja raden.

- 2026-07-13: Menyposten `Favoriter` flyttades till direkt efter `Matcher`.

- 2026-07-13: Spelarnamn och sekundär land/ranking-text på `/favorites` använder nu samma typografiska behandling som spelarraderna på `/players`: normal namnvikt och mindre sekundärtext.

- 2026-07-13: Cellrenderaren i `data-table` får nu radens aktuella `selected`-status. Favoritsidans radioplutt uppdateras därför omedelbart vid radklick även om tabellens kolumndefinitioner är cachade från första renderingen.

- 2026-07-13: `/favorites` använder nu små radioliknande pluppar i spelarcellen för tvåspelarurval i stället för markerad radbakgrund. Raderna är fortsatt klickbara och ett tredje val ersätter det äldsta. `data-table` fick den valfria inställningen `highlightSelectedRows` så andra användningar kan behålla bakgrundsmarkering.

- 2026-07-13: Direkt borttagning av favoriter togs bort från `/favorites`. Sidan fokuserar på översikt och tvåspelarjämförelse; en favorit avmarkeras i stället via stjärnan på spelarens egen profilsida.

- 2026-07-13: Valda `data-table`-rader använder `primary-400/55` i light mode och `primary-500/45` i dark mode. Det skiljer valbakgrunden från tabellens ordinarie `primary-300`/`primary-700`-border så att även intilliggande valda rader behåller synliga cellgränser.

- 2026-07-13: En ny sida `/favorites` och menyposten `Favoriter` lades till. Sidan läser lokalt sparade spelar-id:n, visar spelarna i `data-table` med flagga, namn, land, ranking och kompakt statistik samt låter användaren ta bort favoriter direkt. Två favoriter väljs genom att klicka på raderna och kan öppnas i befintlig head-to-head via `Jämför valda`; ett tredje radklick ersätter det äldsta valet och statusbaren guidar urvalet. Tomt läge ingår.

- 2026-07-13: Gemensamma `data-table` stöder nu valfria klickbara och tangentbordsaktiverade rader via `rowKey`, `isRowSelected` och `onRowClick`. Valda rader får bestående temamarkering, medan länkar, knappar och formulärkontroller i raden behåller sina egna klick.

- 2026-07-13: Jämförelseikonen i den gemensamma matchtabellens sista kolumn centreras nu i cellen, bland annat på `/event/:id`.

- 2026-07-13: Tema- och underlagsklasser speglas nu från React-roten `body` till `html`, och båda dokumentnivåerna har sidans temabakgrund. `Page.Content` begränsar dessutom vertikal scrollkedja. Därmed blottas inte längre en vit webbläsarbakgrund när en intern sida, exempelvis head-to-head, når eller överskrollar nederkanten.

- 2026-07-13: `Page.Content` begränsar nu horisontellt overflow och `data-table` håller sin bredd inom sidytan med intern scrollning. Breda tabeller skapar därför inte längre en vit, sidövergripande horisontell scrollbar som kan täcka nederdelen av innehållet.

- 2026-07-13: `data-table` lägger nu randning och hoverfärg direkt på samtliga celler i raden. Det undviker att den globala bakgrundsärvningen staplar halvtransparenta färger olika per kolumn och gör hela raden visuellt enhetlig. Dark-mode-hover använder en nedtonad `primary-600/75` medan tabellens opaka `primary-700`-border behålls, så markeringen blir mörkare utan att rutnätet försvinner.

- 2026-07-13: `Start` i båda matchtabellerna använder nu `Table.SortValue` med radens `_startTimestamp`. Cellen behåller sitt relativa svenska visningsvärde, exempelvis `I morgon 19:30`, medan sorteringen sker kronologiskt.

- 2026-07-13: En kompakt favoritsektion med tvåspelarurval provades på `/players` men togs bort igen. Stjärnan och den lokala favoritlagringen på `/player/:id` behålls medan en bättre användning utvärderas.

- 2026-07-13: Den numera mycket korta initialladdningen på `/matches` visar den pulserande tennisbollen med endast den fasta texten `Hämtar matcher…` undertill. Progressbar och växlande delstegsmeddelanden är borta; statusbaren efter att matcherna visas behålls.

- 2026-07-13: Favoritstjärnan på spelarsidan uppdateras nu utan att montera om sidans innehåll. Lokala `Content` och `Title` används som renderhjälpare i stället för nya React-komponenttyper vid varje favoritklick.

- 2026-07-13: En minimal lokal favoritfunktion lades till på `/player/:id`. En högerjusterad konturstjärna i spelartiteln växlar till en temafärgad fylld stjärna och sparar endast spelar-id:n i `vitel`-lagringens `favorite-player-ids`. Ingen favoritlista, filtrering eller annan följdfunktion har lagts till ännu.

- 2026-07-13: `/players` och `/events` kopplar nu explicit in `Page.StatusBar`. De visar antal standardrader, aktuell sökning och antal träffar samt laddnings- och fellägen utan att ersätta tabellinnehållet.

- 2026-07-13: Återanvändbara `Page.StatusBar` lades till som ett explicit flexbarn på de sidor som behöver den, inte globalt och utan overlay. `/matches` visar antal live/kommande matcher samt TA/GPT-status där, och `/scoreboard` visar liveantal, uppdatering och diskreta varningar. Light mode använder sidans ljusa bakgrund med en diskret överkant; dark mode använder en mörk statusbar. Tidigare lösa statusrader i sidinnehållet togs bort.

- 2026-07-13: `/events` fick samma responsiva sökfält i sidtiteln som `/players`. Sökningen går över hela turneringshistoriken och matchar namn, plats, typ och underlag, inklusive svenska underlagsord. Den använder 350 ms debounce och behåller tidigare tabellresultat under hämtning.

- 2026-07-13: `/scoreboard` renderar nu livekort direkt från Oddset-data. Land, flagga, ranking och head-to-head fylls på progressivt; fel i spelar- eller head-to-head-data döljer inte längre fungerande livematcher. Tidigare data behålls också under uppdateringar.

- 2026-07-13: Den uppskattade progressbaren och procentlogiken togs bort från `/matches`-laddningen. Tennisboll och aktuell laddningstext behålls.

- 2026-07-13: `/matches` renderar nu Oddset-matchlistan så snart den är tillgänglig. TA/GPT-batchen körs i en separat bakgrundsquery och fyller oddskolumnerna när den är klar; ett oddsfel döljer inte längre matcherna.

- 2026-07-13: Spelarsökfältets border i light mode använder nu samma `primary-500`-ton både med och utan fokus. Fokusringen finns kvar som separat tillgänglighetsmarkering.

- 2026-07-13: Den gamla separata `/search`-sidan, menyns sökikon och F4-sökgenvägen togs bort. Spelarsökning finns nu endast direkt i `/players`-sidans titel.

- 2026-07-13: Spelarsökfältets light mode tonades ned från nästan vitt till `primary-700`, med `primary-800`-kant och ljus text, ikon och placeholder. Dark mode behölls.

- 2026-07-13: Spelarsökningens debounce justerades till 350 ms och föregående tabellresultat ligger kvar medan nästa sökning hämtas. Det minskar flimmer under snabb inmatning utan att sökningen känns långsam.

- 2026-07-13: Spelarsökfältet behåller nu fokus när sökresultaten kommer tillbaka. Den lokala `Content`-funktionen anropas som renderhjälp i stället för att behandlas som en ny React-komponenttyp vid varje render.

- 2026-07-13: Spelarsökningen i `/players` gjordes aktiv från första tecknet. Browserns extra sökkryss togs bort genom ett vanligt textfält, formen blev helt pillrund och den gamla globala artificiella minimitiden på 1,5 sekunder per API-anrop togs bort ur `service.js`.

- 2026-07-13: `/players` fick ett responsivt spelarsökfält i sidtiteln. Utan sökning visas topp 100; vid sökning visas upp till 25 fullständiga spelarträffar.

- 2026-07-13: Sista kolumnen i spelarsidans matchtabell fick samma stapelikon och lilla rundade ram för spelarjämförelse som övriga jämförelselänkar. Den synliga kolumnrubriken togs bort men behölls skärmläsarvänligt.

- 2026-07-13: Vanliga pillformade knappar fick en synlig `primary-500`-border även i viloläge. Huvudmenyn behåller sin transparenta border genom sin separata override.

- 2026-07-13: Laddningsbollens och huvudmenyns underkomponenter flyttades till stabila komponentdefinitioner. Progressuppdateringarna på `/matches` startar därmed inte längre om bollanimationen eller återställer menyns hoverläge.

- 2026-07-13: `/matches` hämtar nu TA- och GPT-odds för alla matcher genom ett enda `POST /api/odds/matches` i stället för ett separat HTTP-anrop per match.

- 2026-07-13: `/matches` förenklades till två tabellsektioner, `Pågående matcher` och `Kommande matcher`. Den tidigare grupperingen per turnering togs bort och `Turnering` visas nu som första kolumn i båda tabellerna.

- 2026-07-12: Arbetsflödet ändrades så att varje färdig ändring i Vitel byggs och laddas upp direkt med `npm run upload`, om inget annat anges.

- 2026-07-12: Vitel är åter primär klient att förbättra; native-projektet
  `match-point` är pausat. TA och GPT utgår båda från samma dagligen importerade
  Tennis Abstract-Elo i MariaDB. TA är ren Elo medan GPT kommer från backendens
  `PLAYER_ODDS` / `PLAYER_WIN_FACTOR`. Vitel ska endast konsumera `/api/odds`
  och aldrig hämta Tennis Abstract direkt; endast `atp-import` äger
  TA-nätberoendet. Backend `atp-tennis` commit `9523622` tog bort TA-anrop från
  `atp-service`.

- 2026-07-12: `Nyheter` och den externa kopplingen till det nedlagda
  Tennis Daily-projektet togs bort från huvudmenyn.

- 2026-07-12: Oddsmodellen och klientkolumnen bytte namn från `CODEX` till
  `GPT`; backendkontraktet `/api/odds` använder nu `gptOdds`.
- 2026-07-12: Matchsidans tidigare `Vitel`-odds pensionerades och ersattes av
  GPT-modellen. Backendkontraktet `/api/odds` använder `gptOdds` tillsammans
  med `tennisAbstractOdds`. Den kanoniska modellen ligger i `atp-tennis`
  `PLAYER_WIN_FACTOR` och motsvarar Match Points TA-kalibrerade sexfeaturesmodell.

- 2026-06-30: Projektkontexten uppdaterades med aktuell produktionsbild:
  frontendens statiska root är `/var/www/html/vitel` på `pi-kato`,
  `tennis.egelberg.se/api` reverse-proxyar till backendens
  `http://localhost:3004/api`, och `npm run upload` deployar dit via `scp`.
- 2026-03-30: Backendens `/api/ping` utökades till att returnera `version`, backendversionen bumpades till `1.0.1`, och `atp-service` deployades om på `pi-kato`. Detta kan användas som enkel verifiering från frontend/MCP-sidan att rätt backendkod körs live.
- 2026-03-30: Gemensam tvärrepo-kontext sparades här. Den här Codex-tråden används nu som huvudkonversation för `vitel`, `atp-tennis` och `atp-tennis-mcp`, och spelaruppslag i backend/MCP-kedjan flyttas från gamla `/api/search-player` till `/api/player/search` och `/api/player/lookup`.

- 2026-03-26: `CODEX.md` synkades med aktuellt läge. `/trial` dokumenteras nu uttryckligen som aktiv intern testsida, `/ranking` som borttagen route och söksidan som förenklad till ett renare sökflöde utan jämförfunktion.
- 2026-03-26: Söksidan förenklades. Historiken begränsades till sex senaste sökningar, jämförflödet togs bort, text/styling justerades och sidan ska nu läsas som en ren spelarsökning snarare än ett sekundärt head-to-head-verktyg.
- 2026-03-26: `/ranking` togs bort helt som separat sida och route eftersom den inte längre nåddes från appen och inte gav tillräckligt egenvärde jämfört med rankinginformation inbäddad i övriga vyer.
- 2026-03-26: Mindre kodsanering genomfördes i UI-lagret: död kod togs bort från startsidan, `events` och `settings` standardiserades till `Page.Menu`, och tillfälliga `console.*`-loggar rensades bort för att hålla klientkoden tystare som default.
- 2026-03-24: `src/js/live-oddset.js` slutade hämta Oddset direkt från Kambi i browsern. Liveodds för `/matches` och `/scoreboard` går nu via backendens `GET /oddset`, och frontend filtrerar själv ut rader med `state === 'STARTED'`, vilket gör `/oddset` till den gemensamma odds-endpointen i frontenden.
- 2026-03-21: `/head-to-head-details/:A/:B` fick en diskret beskrivnings-popup per fråga. `@description` från query-filerna kan nu öppnas via en liten info-knapp bredvid frågetexten och renderas som Markdown utan att tabellayouten ändras.
- 2026-03-21: Numreringen för `src/pages/head-to-head-details/queries/*.sql` ändrades till steg om 10 (`10-...`, `20-...`, `30-...`) för att göra det enklare att placera in nya frågor mellan befintliga.
- 2026-03-21: En ny head-to-head-detaljfråga lades till i `src/pages/head-to-head-details/queries/30-win-rate-vs-better-ranked-last-12-months.sql`. Den visar vinstprocent mot bättre rankade motståndare över 3/6/12 månader och kräver minst 5 sådana matcher i respektive period för att visa ett värde.
- 2026-03-20: Auto-underlaget i `src/js/theme.js` justerades från 2026-specifika datum till återkommande säsongsfönster över året. Logiken är fortfarande ATP-kalenderstyrd, men uttrycks nu som månad/dag-intervall så att Miami-perioden blir hardcourt varje år utan årlig kodändring.
- 2026-03-20: Temalogiken bröts ut till `src/js/theme.js`, och auto-underlag styrs nu via kuraterade datumfönster för ATP-säsongen 2026 i stället för den tidigare enkla månadslogiken. Syftet är att bättre matcha stora turneringsperioder som Miami (hard), grussvingen, grässvingen och sommarens sena hardcourtperiod.
- 2026-03-20: `/head-to-head-details/:A/:B` refaktorerades till en SQL-driven sida. Frågorna ligger lokalt i `src/pages/head-to-head-details/queries/*.sql`, en lokal loader `src/pages/head-to-head-details/queries.js` lades till och sidan visar nu en enda trekolumnstabell (`Fråga`, spelare A, spelare B).
- 2026-03-20: En ny route `/head-to-head-details/:A/:B` lades till som separat fördjupningssida för head-to-head. `/head-to-head/:A/:B` behölls lättare och fick bara en knapp längst ned som länkar vidare till den nya sidan.
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
