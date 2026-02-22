/*
@title
Spelare med mest intjänade prispengar

@description
Visar spelare sorterade på totala karriärens prispengar.
Aktivt intervall baseras på första och sista året spelaren förekommer i matchdata.

*/
SELECT
    p.name AS Namn,
    p.country AS Land,
    CONCAT('$', FORMAT(p.career_prize, 0)) AS Prispengar,
    CONCAT(MIN(YEAR(e.date)), '–', MAX(YEAR(e.date))) AS Aktiv
FROM
    players p
    JOIN matches m ON m.winner = p.id
    OR m.loser = p.id
    JOIN events e ON e.id = m.event
WHERE
    p.career_prize IS NOT NULL
    AND p.career_prize > 0
    AND e.date IS NOT NULL
GROUP BY
    p.id,
    p.name,
    p.country,
    p.career_prize
ORDER BY
    p.career_prize DESC,
    p.name ASC
LIMIT
    100;