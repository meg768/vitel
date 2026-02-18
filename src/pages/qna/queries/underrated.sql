/*

@title
Andel vinster mot bättre rankade

@description
Visar spelare som, senaste 12 månaderna, har hög andel vinster i matcher där motståndaren är bättre rankad (lägre rankingtal).
Högre andel vinster = mer "under rated".

*/

WITH matcher_senaste_12m AS (
    SELECT
        event_date,
        winner_id,
        loser_id
    FROM flatly
    WHERE event_date >= (CURDATE() - INTERVAL 12 MONTH)
      AND winner_id IS NOT NULL
      AND loser_id IS NOT NULL
),
perspektiv AS (
    -- Spelarens perspektiv (som vinnare)
    SELECT
        m.event_date,
        m.winner_id AS player_id,
        pw.rank AS player_rank,
        pl.rank AS opponent_rank,
        1 AS win
    FROM matcher_senaste_12m m
    JOIN players pw ON pw.id = m.winner_id
    JOIN players pl ON pl.id = m.loser_id
    WHERE pw.rank IS NOT NULL
      AND pl.rank IS NOT NULL

    UNION ALL

    -- Spelarens perspektiv (som förlorare)
    SELECT
        m.event_date,
        m.loser_id AS player_id,
        pl.rank AS player_rank,
        pw.rank AS opponent_rank,
        0 AS win
    FROM matcher_senaste_12m m
    JOIN players pw ON pw.id = m.winner_id
    JOIN players pl ON pl.id = m.loser_id
    WHERE pw.rank IS NOT NULL
      AND pl.rank IS NOT NULL
),
mot_battre_rankade AS (
    SELECT
        player_id,
        player_rank,
        SUM(win) AS wins_vs_better,
        COUNT(*) AS matches_vs_better
    FROM perspektiv
    WHERE opponent_rank < player_rank
    GROUP BY player_id, player_rank
)
SELECT
    CONCAT(p.name, ' (', p.country, ')') AS `Namn (Land)`,
    mb.player_rank AS `Ranking`,
    ROUND(100 * mb.wins_vs_better / NULLIF(mb.matches_vs_better, 0), 0) AS `Andel vinster`
FROM mot_battre_rankade mb
JOIN players p ON p.id = mb.player_id
WHERE p.active = 1
  AND mb.matches_vs_better >= 10
ORDER BY
    `Andel vinster` DESC,
    mb.matches_vs_better DESC,
    `Ranking` ASC;