/*
@title
Längsta matcherna genom tiderna

@description
Visar de 50 längsta matcherna i databasen genom tiderna (Open Era, dvs från 1968).
*/


SELECT
    e.date AS `Datum`,

    CONCAT(e.name, ' (', e.type, ')') AS `Turnering`,

    CONCAT(pw.name, ' (', pw.country, ')') AS `Vinnare`,
    CONCAT(pl.name, ' (', pl.country, ')') AS `Förlorare`,

    m.round AS `Runda`,

    m.score AS `Resultat`,

    NUMBER_OF_GAMES_PLAYED(m.score) AS `Antal Game`,

    m.duration AS `Speltid`

FROM matches m
JOIN events  e  ON e.id = m.event
JOIN players pw ON pw.id = m.winner
JOIN players pl ON pl.id = m.loser

WHERE m.duration IS NOT NULL
  AND m.duration <> ''
  AND (
        m.duration REGEXP '^[0-9]{2}:[0-9]{2}:[0-9]{2}$'
     OR m.duration REGEXP '^[0-9]{2}:[0-9]{2}$'
  )

ORDER BY
    CASE
        WHEN m.duration REGEXP '^[0-9]{2}:[0-9]{2}:[0-9]{2}$' THEN
            CAST(SUBSTRING_INDEX(m.duration, ':', 1) AS UNSIGNED) * 3600 +
            CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(m.duration, ':', 2), ':', -1) AS UNSIGNED) * 60 +
            CAST(SUBSTRING_INDEX(m.duration, ':', -1) AS UNSIGNED)

        WHEN m.duration REGEXP '^[0-9]{2}:[0-9]{2}$' THEN
            CAST(SUBSTRING_INDEX(m.duration, ':', 1) AS UNSIGNED) * 3600 +
            CAST(SUBSTRING_INDEX(m.duration, ':', -1) AS UNSIGNED) * 60
    END DESC,
    e.date DESC

LIMIT 50;