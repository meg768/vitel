/*
@title
Rankingklättrare

@description
Aktiva spelare som förbättrat sin ranking mest det senaste året.

Ranking för 12 månader sedan beräknas från spelarens senaste match under perioden
**12–18 månader** sedan (för att få ett stabilt jämförelsevärde).

Endast spelare med aktuell ranking inom **topp 200** visas.
*/

WITH rank_then AS (
    SELECT
        player_id,
        rank_at_match,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY match_date DESC) AS rn
    FROM (
        SELECT winner_id AS player_id, winner_rank AS rank_at_match, event_date AS match_date
        FROM flatly
        WHERE event_date BETWEEN CURDATE() - INTERVAL 18 MONTH AND CURDATE() - INTERVAL 12 MONTH
          AND winner_rank IS NOT NULL

        UNION ALL

        SELECT loser_id AS player_id, loser_rank AS rank_at_match, event_date AS match_date
        FROM flatly
        WHERE event_date BETWEEN CURDATE() - INTERVAL 18 MONTH AND CURDATE() - INTERVAL 12 MONTH
          AND loser_rank IS NOT NULL
    ) all_matches
)
SELECT
    p.rank                                              AS `Rank nu`,
    CONCAT(p.name, ' (', p.country, ')')               AS `Spelare`,
    rt.rank_at_match                                    AS `Rank för 1 år sedan`,
    rt.rank_at_match - p.rank                          AS `Förbättring`
FROM players p
JOIN rank_then rt ON rt.player_id = p.id AND rt.rn = 1
WHERE p.active = 1
  AND p.rank <= 200
  AND rt.rank_at_match > p.rank
ORDER BY `Förbättring` DESC
LIMIT 20;
