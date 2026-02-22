/*
@title
Flest titlar före 21 års ålder

@description
Räknar titlar (F = finalvinst) i Grand Slam, Masters, ATP-500 och ATP-250 där spelaren var yngre än 21 år på eventets datum.
Inga match-statusar exkluderas.
*/

WITH titles_u21 AS (
    SELECT
        f.winner_id                               AS player_id,
        COUNT(DISTINCT f.event_id)                AS titles_before_21,
        MIN(f.event_date)                         AS first_title_date,
        MAX(f.event_date)                         AS last_title_date
    FROM flatly f
    JOIN players p
      ON p.id = f.winner_id
    WHERE f.round = 'F'
      AND f.event_type IN ('Grand Slam','Masters','ATP-500','ATP-250')
      AND p.birthdate IS NOT NULL
      AND f.event_date IS NOT NULL
      AND f.event_date < DATE_ADD(p.birthdate, INTERVAL 21 YEAR)
    GROUP BY
        f.winner_id
)
SELECT
    p.name                    AS `Spelare`,
    titles_before_21          AS `Titlar före 21`,
    TIMESTAMPDIFF(YEAR, p.birthdate, first_title_date) AS `Ålder vid första titeln`,
    first_title_date          AS `Första titel (datum)`,
    last_title_date           AS `Sista titel (datum)`
FROM titles_u21 t
JOIN players p
  ON p.id = t.player_id
ORDER BY
    `Titlar före 21` DESC,
    `Ålder vid första titeln` ASC,
    `Spelare` ASC
LIMIT 50;