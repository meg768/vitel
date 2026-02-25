/*
@title
Top 10 – Aktuell ranking

@description
De tio bäst rankade aktiva spelarna just nu, med matchstatistik de **senaste 3 månaderna**.
*/

WITH recent AS (
    SELECT
        winner_id AS player_id,
        1 AS win
    FROM flatly
    WHERE status = 'Completed'
      AND event_date >= CURDATE() - INTERVAL 3 MONTH

    UNION ALL

    SELECT
        loser_id AS player_id,
        0 AS win
    FROM flatly
    WHERE status = 'Completed'
      AND event_date >= CURDATE() - INTERVAL 3 MONTH
)
SELECT
    p.rank                                                              AS `Rank`,
    CONCAT(p.name, ' (', p.country, ')')                               AS `Spelare`,
    p.age                                                               AS `Ålder`,
    p.career_titles                                                     AS `Titlar`,
    SUM(r.win)                                                          AS `Vinster (3 mån)`,
    SUM(1 - r.win)                                                      AS `Förluster (3 mån)`,
    ROUND(SUM(r.win) * 100.0 / COUNT(*), 0)                            AS `Vinstprocent (3 mån)`
FROM players p
LEFT JOIN recent r ON r.player_id = p.id
WHERE p.active = 1
  AND p.rank IS NOT NULL
GROUP BY p.id, p.rank, p.name, p.country, p.age, p.career_titles
ORDER BY p.rank ASC
LIMIT 10;
