/*
@title
Störst upset-maskin
@description
Spelare som flest gånger besegrat en motståndare rankad **minst 50 platser högre** (lägre ranknummer).

Endast:
- Avslutade matcher (`status = 'Completed'`)
- Turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- Huvuddrag (`R128` och uppåt, inga kvalmatcher)
- Aktiva spelare med en aktuell ranking
- Båda spelarnas ranking måste vara känd vid matchtillfället
*/
WITH
    upsets AS (
        SELECT
            f.winner_id AS player_id,
            COUNT(*) AS upset_wins
        FROM flatly f
        WHERE
            f.status = 'Completed'
            AND f.event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
            AND f.round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
            AND f.winner_rank IS NOT NULL
            AND f.loser_rank IS NOT NULL
            AND f.winner_rank - f.loser_rank >= 50
        GROUP BY f.winner_id
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
    )
SELECT
    CONCAT(p.name, ' (', p.country, ')')                    AS `Spelare`,
    tp.total_matches_played                                  AS `Totala matcher`,
    u.upset_wins                                             AS `Upsets`,
    tw.wins                                                  AS `Totala vinster`,
    ROUND(u.upset_wins * 100.0 / tp.total_matches_played, 1) AS `Andel av matcher (%)`,
    ROUND(u.upset_wins * 100.0 / tw.wins, 1)                AS `Andel av vinster (%)`,
    p.rank                                                   AS `Rank`
FROM upsets u
JOIN players p       ON p.id = u.player_id
                    AND p.active = 1
                    AND p.rank IS NOT NULL
JOIN total_played tp ON tp.player_id = u.player_id
JOIN total_wins tw   ON tw.player_id = u.player_id
ORDER BY
    `Upsets` DESC,
    `Andel av matcher (%)` DESC,
    `Spelare` ASC
LIMIT 50;