/*
@title
Störst fall från topp-50 (senaste 3 åren)

@description
Detta visar aktiva spelare som:
- Har haft sin högsta ranking bättre än 50
- Nådde den högsta rankingen under de senaste tre åren
- Har spelat riktiga matcher (ej W/O eller RET) under de senaste tre åren

Sorteras på störst skillnad mellan nuvarande ranking och högsta ranking.
*/

SELECT
    p.name                AS Namn,
    p.country             AS Land,
    p.rank                AS `Nuvarande ranking`,
    CONCAT(
        p.highest_rank,
        ' (',
        DATE_FORMAT(p.highest_rank_date, '%Y-%m-%d'),
        ')'
    ) AS `Bästa ranking`,
    (p.rank - p.highest_rank) AS Skillnad
FROM players p
WHERE p.active = 1
  AND p.rank > 0
  AND p.highest_rank > 0
  AND p.highest_rank < 50
  AND p.highest_rank_date >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)
  AND EXISTS (
        SELECT 1
        FROM matches m
        JOIN events e ON m.event = e.id
        WHERE (m.winner = p.id OR m.loser = p.id)
          AND e.date >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)
          AND NUMBER_OF_SETS_PLAYED(m.score) > 0
  )
ORDER BY Skillnad DESC, p.rank ASC
LIMIT 50;