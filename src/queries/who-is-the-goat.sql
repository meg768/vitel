/*

@title
Vem är GOAT?

@description
Detta är en subjektiv fråga som inte har ett definitivt svar, 
men här visas olika definitioner av "GOAT" (Greatest Of All Time) 
baserat på olika kriterier, såsom flest titlar, bäst vinstprocent, etc.
Använder endast data från Open Era (från 1968 och framåt) för att vara mer relevant för dagens tennis.
**OBS! Det kan ta lång tid att köra denna fråga.**
*/


SELECT 'Flest titlar' AS `Definition`,
(
    SELECT CONCAT(p.name, ' (', p.country, ') – ', COUNT(*))
    FROM flatly f
    JOIN players p ON p.id = f.winner_id
    WHERE f.round = 'F'
      AND f.winner_id IS NOT NULL
      AND f.event_date >= '1968-01-01'
    GROUP BY f.winner_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
) AS `Resultat`

UNION ALL

SELECT 'Flest Grand Slam-titlar',
(
    SELECT CONCAT(p.name, ' (', p.country, ') – ', COUNT(*))
    FROM flatly f
    JOIN players p ON p.id = f.winner_id
    WHERE f.round = 'F'
      AND f.event_type = 'Grand Slam'
      AND f.winner_id IS NOT NULL
      AND f.event_date >= '1968-01-01'
    GROUP BY f.winner_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Flest Masters-titlar',
(
    SELECT CONCAT(p.name, ' (', p.country, ') – ', COUNT(*))
    FROM flatly f
    JOIN players p ON p.id = f.winner_id
    WHERE f.round = 'F'
      AND f.event_type = 'Masters'
      AND f.winner_id IS NOT NULL
      AND f.event_date >= '1968-01-01'
    GROUP BY f.winner_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Flest finaler spelade',
(
    SELECT CONCAT(p.name, ' (', p.country, ') – ', COUNT(*))
    FROM (
        SELECT winner_id AS player_id
        FROM flatly
        WHERE round = 'F'
          AND event_date >= '1968-01-01'
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id
        FROM flatly
        WHERE round = 'F'
          AND event_date >= '1968-01-01'
          AND loser_id IS NOT NULL
    ) x
    JOIN players p ON p.id = x.player_id
    GROUP BY x.player_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Bäst vinstprocent (minst 200 matcher)',
(
    SELECT CONCAT(
        p.name, ' (', p.country, ') – ',
        ROUND(100 * SUM(win) / COUNT(*), 0), '%'
    )
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 200
    ORDER BY (SUM(win) / COUNT(*)) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Bäst vinstprocent i Grand Slam (minst 50 matcher)',
(
    SELECT CONCAT(
        p.name, ' (', p.country, ') – ',
        ROUND(100 * SUM(win) / COUNT(*), 0), '%'
    )
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND event_type = 'Grand Slam'
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND event_type = 'Grand Slam'
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 50
    ORDER BY (SUM(win) / COUNT(*)) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Flest vinster mot Top 10 (minst 50 matcher mot Top 10)',
(
    SELECT CONCAT(p.name, ' (', p.country, ') – ', SUM(win))
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND loser_rank IS NOT NULL
          AND loser_rank <= 10
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_rank IS NOT NULL
          AND winner_rank <= 10
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 50
    ORDER BY SUM(win) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Bäst vinstprocent mot Top 10 (minst 50 matcher mot Top 10)',
(
    SELECT CONCAT(
        p.name, ' (', p.country, ') – ',
        ROUND(100 * SUM(win) / COUNT(*), 0), '%'
    )
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND loser_rank IS NOT NULL
          AND loser_rank <= 10
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_rank IS NOT NULL
          AND winner_rank <= 10
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 50
    ORDER BY (SUM(win) / COUNT(*)) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Flest vinster mot bättre rankade (minst 100 matcher)',
(
    SELECT CONCAT(p.name, ' (', p.country, ') – ', SUM(win))
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_rank IS NOT NULL
          AND loser_rank IS NOT NULL
          AND loser_rank < winner_rank
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_rank IS NOT NULL
          AND loser_rank IS NOT NULL
          AND winner_rank < loser_rank
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 100
    ORDER BY SUM(win) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Bäst vinstprocent mot bättre rankade (minst 100 matcher)',
(
    SELECT CONCAT(
        p.name, ' (', p.country, ') – ',
        ROUND(100 * SUM(win) / COUNT(*), 0), '%'
    )
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_rank IS NOT NULL
          AND loser_rank IS NOT NULL
          AND loser_rank < winner_rank
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_rank IS NOT NULL
          AND loser_rank IS NOT NULL
          AND winner_rank < loser_rank
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 100
    ORDER BY (SUM(win) / COUNT(*)) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Bäst vinstprocent i Grand Slam-finaler (minst 10 finaler)',
(
    SELECT CONCAT(
        p.name, ' (', p.country, ') – ',
        ROUND(100 * SUM(win) / COUNT(*), 0), '%'
    )
    FROM (
        SELECT winner_id AS player_id, 1 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND event_type = 'Grand Slam'
          AND round = 'F'
          AND winner_id IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, 0 AS win
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND event_type = 'Grand Slam'
          AND round = 'F'
          AND loser_id IS NOT NULL
    ) m
    JOIN players p ON p.id = m.player_id
    GROUP BY m.player_id
    HAVING COUNT(*) >= 10
    ORDER BY (SUM(win) / COUNT(*)) DESC, COUNT(*) DESC
    LIMIT 1
)

UNION ALL

SELECT 'Längsta svit matcher som #1',
(
    WITH matchperspektiv AS (
        SELECT
            id,
            event_date,
            winner_id AS player_id,
            winner_rank AS rank_at_match
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND winner_id IS NOT NULL
          AND winner_rank IS NOT NULL

        UNION ALL

        SELECT
            id,
            event_date,
            loser_id AS player_id,
            loser_rank AS rank_at_match
        FROM flatly
        WHERE event_date >= '1968-01-01'
          AND loser_id IS NOT NULL
          AND loser_rank IS NOT NULL
    ),
    ordnad AS (
        SELECT
            *,
            CASE WHEN rank_at_match = 1 THEN 1 ELSE 0 END AS is_number_one,
            SUM(CASE WHEN rank_at_match <> 1 THEN 1 ELSE 0 END)
                OVER (PARTITION BY player_id ORDER BY event_date, id) AS break_group
        FROM matchperspektiv
    ),
    streaks AS (
        SELECT
            player_id,
            break_group,
            COUNT(*) AS streak_matches,
            MIN(event_date) AS start_date,
            MAX(event_date) AS end_date
        FROM ordnad
        WHERE is_number_one = 1
        GROUP BY player_id, break_group
    ),
    best AS (
        SELECT
            *,
            ROW_NUMBER() OVER (ORDER BY streak_matches DESC, end_date DESC) AS rnk
        FROM streaks
    )
    SELECT
        CONCAT(
            p.name, ' (', p.country, ') – ',
            b.streak_matches, ' matcher (',
            DATE_FORMAT(b.start_date, '%Y-%m-%d'), '–',
            DATE_FORMAT(b.end_date, '%Y-%m-%d'), ')'
        )
    FROM best b
    JOIN players p ON p.id = b.player_id
    WHERE b.rnk = 1
) AS `Resultat`
;