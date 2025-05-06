/*
Spelare med ranking mellan 50 och 100 som vunnit mot topp-10 spelare senaste året sorterat efter ranking.
*/

SELECT
    *
FROM
    players
WHERE
    id IN (
        SELECT DISTINCT
            winner_id
        FROM
            flatly
        WHERE
            event_date >= CURDATE() - INTERVAL 52 WEEK
            AND winner_rank IS NOT NULL
            AND loser_rank IS NOT NULL
            AND winner_rank <= 100
            AND winner_rank >= 50
            AND loser_rank <= 10
        ORDER BY
            winner_rank - loser_rank DESC
    )
ORDER BY
    rank, age
