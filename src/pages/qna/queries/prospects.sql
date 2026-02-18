/*

@title
Top 20 yngsta aktiva spelare

@description
Visar de 20 yngsta aktiva spelarna som spelat minst 10 matcher senaste 12 månaderna.
Inkluderar ålder, aktuell ranking, bästa ranking (med datum) samt andel vinster senaste 12 månaderna.

*/

WITH matchrader_12m AS (
    SELECT
        winner_id AS player_id,
        1 AS vinst
    FROM flatly
    WHERE event_date >= (CURDATE() - INTERVAL 12 MONTH)
      AND winner_id IS NOT NULL

    UNION ALL

    SELECT
        loser_id AS player_id,
        0 AS vinst
    FROM flatly
    WHERE event_date >= (CURDATE() - INTERVAL 12 MONTH)
      AND loser_id IS NOT NULL
),
matchdata AS (
    SELECT
        player_id,
        COUNT(*) AS matcher_12m,
        SUM(vinst) AS vinster_12m
    FROM matchrader_12m
    GROUP BY player_id
)
SELECT
    CONCAT(p.name, ' (', p.country, ')') AS `Spelare`,
    TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS `Ålder`,
    p.rank AS `Ranking`,
    CONCAT(p.highest_rank, ' (', DATE_FORMAT(p.highest_rank_date, '%Y-%m-%d'), ')') AS `Bästa ranking`,
    ROUND(100 * md.vinster_12m / md.matcher_12m, 0) AS `Andel vinster`
FROM players p
JOIN matchdata md ON md.player_id = p.id
WHERE p.active = 1
  AND p.birthdate IS NOT NULL
  AND md.matcher_12m >= 10
ORDER BY
    `Ålder` ASC,
    `Andel vinster` DESC
LIMIT 20;