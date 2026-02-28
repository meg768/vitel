/*
@title
Månadslön för en tennisspelare genom tiderna

@description
Indexreglerar karriärens totala prispengar till 2025 års penningvärde.
Approximation: mittår i karriären används för indexering.
Minst 5 aktiva år krävs.
*/
WITH
CPI (year, cpi) AS (
    SELECT 1968, 34.8 UNION ALL
    SELECT 1969, 36.7 UNION ALL
    SELECT 1970, 38.8 UNION ALL
    SELECT 1971, 40.5 UNION ALL
    SELECT 1972, 41.8 UNION ALL
    SELECT 1973, 44.4 UNION ALL
    SELECT 1974, 49.3 UNION ALL
    SELECT 1975, 53.8 UNION ALL
    SELECT 1976, 56.9 UNION ALL
    SELECT 1977, 60.6 UNION ALL
    SELECT 1978, 65.2 UNION ALL
    SELECT 1979, 72.6 UNION ALL
    SELECT 1980, 82.4 UNION ALL
    SELECT 1981, 90.9 UNION ALL
    SELECT 1982, 96.5 UNION ALL
    SELECT 1983, 99.6 UNION ALL
    SELECT 1984, 103.9 UNION ALL
    SELECT 1985, 107.6 UNION ALL
    SELECT 1986, 109.6 UNION ALL
    SELECT 1987, 113.6 UNION ALL
    SELECT 1988, 118.3 UNION ALL
    SELECT 1989, 124.0 UNION ALL
    SELECT 1990, 130.7 UNION ALL
    SELECT 1991, 136.2 UNION ALL
    SELECT 1992, 140.3 UNION ALL
    SELECT 1993, 144.5 UNION ALL
    SELECT 1994, 148.2 UNION ALL
    SELECT 1995, 152.4 UNION ALL
    SELECT 1996, 156.9 UNION ALL
    SELECT 1997, 160.5 UNION ALL
    SELECT 1998, 163.0 UNION ALL
    SELECT 1999, 166.6 UNION ALL
    SELECT 2000, 172.2 UNION ALL
    SELECT 2001, 177.1 UNION ALL
    SELECT 2002, 179.9 UNION ALL
    SELECT 2003, 184.0 UNION ALL
    SELECT 2004, 188.9 UNION ALL
    SELECT 2005, 195.3 UNION ALL
    SELECT 2006, 201.6 UNION ALL
    SELECT 2007, 207.3 UNION ALL
    SELECT 2008, 215.303 UNION ALL
    SELECT 2009, 214.537 UNION ALL
    SELECT 2010, 218.056 UNION ALL
    SELECT 2011, 224.939 UNION ALL
    SELECT 2012, 229.594 UNION ALL
    SELECT 2013, 232.957 UNION ALL
    SELECT 2014, 236.736 UNION ALL
    SELECT 2015, 237.017 UNION ALL
    SELECT 2016, 240.007 UNION ALL
    SELECT 2017, 245.120 UNION ALL
    SELECT 2018, 251.107 UNION ALL
    SELECT 2019, 255.657 UNION ALL
    SELECT 2020, 258.811 UNION ALL
    SELECT 2021, 270.970 UNION ALL
    SELECT 2022, 292.655 UNION ALL
    SELECT 2023, 304.702 UNION ALL
    SELECT 2024, 313.689 UNION ALL
    SELECT 2025, 321.943
),
AktivaAr AS (
    SELECT player_id,
           MIN(y) AS first_year,
           MAX(y) AS last_year
    FROM (
        SELECT m.winner AS player_id, YEAR(e.date) AS y
        FROM matches m
        JOIN events e ON e.id = m.event
        UNION ALL
        SELECT m.loser  AS player_id, YEAR(e.date) AS y
        FROM matches m
        JOIN events e ON e.id = m.event
    ) t
    GROUP BY player_id
),
Mal AS (
    SELECT cpi AS target_cpi
    FROM CPI
    WHERE year = 2025
)
SELECT
    CONCAT(p.name, ' (', p.country, ')') AS `Spelare`,
    CONCAT(CAST(a.first_year AS CHAR), CONVERT(UNHEX('E2808E') USING utf8mb4)) AS `Första år`,
    CONCAT(CAST(a.last_year  AS CHAR), CONVERT(UNHEX('E2808E') USING utf8mb4)) AS `Sista år`,
    CAST((a.last_year - a.first_year + 1) AS CHAR) AS `Aktiva år`,
    CONCAT('$', FORMAT(p.career_prize, 0)) AS `Totala prispengar`,
    CONCAT(
        '$',
        FORMAT(
            (
                p.career_prize
                * (SELECT target_cpi FROM Mal)
                / (SELECT cpi FROM CPI WHERE year = FLOOR((a.first_year + a.last_year) / 2))
            )
            / ((a.last_year - a.first_year + 1) * 12),
            0
        )
    ) AS `Månadslön (indexreglerad)`
FROM AktivaAr a
JOIN players p ON p.id = a.player_id
WHERE (a.last_year - a.first_year + 1) >= 5
  AND p.career_prize IS NOT NULL
ORDER BY
    (
        p.career_prize
        * (SELECT target_cpi FROM Mal)
        / (SELECT cpi FROM CPI WHERE year = FLOOR((a.first_year + a.last_year) / 2))
    )
    / ((a.last_year - a.first_year + 1) * 12) DESC
LIMIT 30;
