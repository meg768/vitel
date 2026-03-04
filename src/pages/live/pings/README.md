# Pings

Varje fil i denna mapp beskriver en enkel signal som kan bli `true` eller `false`
baserat på matchens score.

Tanken är:

- en fil per signal
- en svensk kommentar överst som förklarar när signalen blir sann
- en liten funktion som bara ansvarar for just den signalen

Exempel:

- `won-first-set`
- `lost-first-set`
- `won-second-set`
- `lost-second-set`

Mer komplexa scenarier byggs sedan genom att kombinera flera pings i en scenariofil.

## Score-format

`score` är en sträng där varje avslutat eller pågående set skrivs med mellanslag mellan delarna.

Exempel:

- `6-4 3-0 [30-0]`
- `5-7 2-3 [30-40]`
- `6-4 7-6(3)`
- `6-1 6-2`

Regler:

- `6-4` betyder att spelaren vann setet med 6-4.
- `4-6` betyder att spelaren förlorade setet med 4-6.
- `7-6(3)` betyder att setet gick till tie-break och att spelaren vann setet med 7-6.
- `6-7(5)` betyder att setet gick till tie-break och att spelaren förlorade setet med 6-7.
- Hakparenteser, till exempel `[30-0]`, beskriver poängen i det pågående gamet och ska normalt inte räknas som ett avslutat set.
- Om score bara är `[15-15]` finns ännu inget avslutat set.

Praktiskt för pings:

- Första setet är den första giltiga setdelen före eventuell hakparentes.
- Andra setet är den andra giltiga setdelen före eventuell hakparentes.
- Tie-break-informationen i parentes, till exempel `(3)`, hör till setet men ändrar inte vem som vann setet.
