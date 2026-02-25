/*
@title
Bäst i form just nu

@description
Aktiva spelare rankade inom **topp 100** som haft bäst vinstprocent de **senaste 3 månaderna**.

Endast:
- Avslutade matcher (`status = 'Completed'`)
- Turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- Huvuddrag (`R128` och uppåt, inga kvalmatcher)
- Minst **5 spelade matcher** under perioden
*/

WITH recent AS (
    SELECT winner_id AS player_id, 1 AS win
    FROM flatly
    WHERE status = 'Completed'
      AND event_date >= CURDATE() - INTERVAL 3 MONTH
      AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
      AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

    UNION ALL

    SELECT loser_id AS player_id, 0 AS win
    FROM flatly
    WHERE status = 'Completed'
      AND event_date >= CURDATE() - INTERVAL 3 MONTH
      AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
      AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
)
SELECT
    p.rank                                              AS `Rank`,
    CONCAT(p.name, ' (', p.country, ')')               AS `Spelare`,
    COUNT(*)                                            AS `Matcher`,
    SUM(r.win)                                          AS `Vinster`,
    COUNT(*) - SUM(r.win)                               AS `Förluster`,
    ROUND(SUM(r.win) * 100.0 / COUNT(*), 0)            AS `Vinstprocent (%)`
FROM recent r
JOIN players p ON p.id = r.player_id
WHERE p.active = 1
  AND p.rank <= 100
GROUP BY p.id, p.rank, p.name, p.country
HAVING COUNT(*) >= 5
ORDER BY
    `Vinstprocent (%)` DESC,
    `Vinster` DESC
LIMIT 20;
