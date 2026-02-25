/*
@title
Flest omvända matcher
@description
Räknar matcher där spelaren **förlorade första setet men vann matchen**.

Endast:
- Avslutade matcher (`status = 'Completed'`)
- Turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- Huvuddrag (`R128` och uppåt, inga kvalmatcher)
- Aktiva spelare med en aktuell ranking
*/
WITH
    first_set AS (
        SELECT
            f.winner_id AS player_id,
            f.id AS match_id,
            CAST(SUBSTRING_INDEX(
                SUBSTRING_INDEX(SUBSTRING_INDEX(f.score, ' ', 1), '(', 1),
            '-', 1) AS UNSIGNED) AS w_games,
            CAST(SUBSTRING_INDEX(
                SUBSTRING_INDEX(SUBSTRING_INDEX(f.score, ' ', 1), '(', 1),
            '-', -1) AS UNSIGNED) AS l_games
        FROM flatly f
        WHERE
            f.status = 'Completed'
            AND f.event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
            AND f.round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
            AND f.score IS NOT NULL
            AND f.score != ''
    ),
    comebacks AS (
        SELECT
            player_id,
            COUNT(*) AS comebacks
        FROM first_set
        WHERE w_games < l_games
        GROUP BY player_id
    ),
    total_wins AS (
        SELECT
            winner_id AS player_id,
            COUNT(*) AS wins
        FROM flatly
        WHERE
            status = 'Completed'
            AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
            AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
        GROUP BY winner_id
    ),
    total_played AS (
        SELECT player_id, COUNT(*) AS total_matches_played
        FROM (
            SELECT winner_id AS player_id FROM flatly
            WHERE status = 'Completed'
              AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
              AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
            UNION ALL
            SELECT loser_id AS player_id FROM flatly
            WHERE status = 'Completed'
              AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
              AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
        ) all_matches
        GROUP BY player_id
    )
SELECT
    CONCAT(p.name, ' (', p.country, ')')                   AS `Spelare`,
    tp.total_matches_played                                 AS `Totala matcher`,
    cb.comebacks                                            AS `Omvända matcher`,
    tw.wins                                                 AS `Totala vinster`,
    ROUND(cb.comebacks * 100.0 / tp.total_matches_played, 1) AS `Andel av matcher (%)`,
    ROUND(cb.comebacks * 100.0 / tw.wins, 1)               AS `Andel av vinster (%)`,
    p.rank                                                  AS `Rank`
FROM comebacks cb
JOIN players p       ON p.id = cb.player_id
                    AND p.active = 1
                    AND p.rank IS NOT NULL
JOIN total_wins tw   ON tw.player_id = cb.player_id
JOIN total_played tp ON tp.player_id = cb.player_id
ORDER BY
    `Omvända matcher` DESC,
    `Andel av vinster (%)` DESC,
    `Spelare` ASC
LIMIT 50;