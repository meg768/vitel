/*

    @title
    Unga lovande spelare (aka "Prospects")

    @description
    Detta visar de 20 yngsta aktiva spelarna som spelat minst 10 matcher senaste året.
    Därefter sorteras dessa 20 efter aktuell ranking.
    Visar ålder aktuell ranking, bästa ranking samt andel vinster (%) senaste året.


*/

WITH matchrader_12m AS (
    SELECT winner_id AS player_id, 1 AS vinst
    FROM flatly
    WHERE event_date >= (CURDATE() - INTERVAL 12 MONTH)
      AND winner_id IS NOT NULL

    UNION ALL

    SELECT loser_id AS player_id, 0 AS vinst
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
),
yngsta_20 AS (
    SELECT
        p.id,
        p.name,
        p.country,
        p.rank,
        p.highest_rank,
        p.birthdate,
        md.matcher_12m,
        md.vinster_12m
    FROM players p
    JOIN matchdata md ON md.player_id = p.id
    WHERE p.active = 1
      AND p.birthdate IS NOT NULL
      AND p.rank IS NOT NULL
      AND md.matcher_12m >= 10
    ORDER BY
        p.birthdate DESC,  -- yngst först
        p.rank ASC
    LIMIT 20
)
SELECT
    CONCAT(name, ' (', country, ')') AS `Spelare`,
    TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) AS `Ålder`,
    rank AS `Ranking`,
    highest_rank AS `Bästa ranking`,
    ROUND(100 * vinster_12m / matcher_12m, 0) AS `Vinster (%)`
FROM yngsta_20
ORDER BY
    `Ranking` ASC,
    `Vinster (%)` DESC;