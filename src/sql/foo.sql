SELECT
    CASE
        WHEN clay_wins + clay_losses = 0 THEN NULL
        ELSE ROUND(clay_wins * 100 / (clay_wins + clay_losses), 0)
    END AS clay_factor,
    CASE
        WHEN hard_wins + hard_losses = 0 THEN NULL
        ELSE ROUND(hard_wins * 100 / (hard_wins + hard_losses), 0)
    END AS hard_factor,
    CASE
        WHEN grass_wins + grass_losses = 0 THEN NULL
        ELSE ROUND(grass_wins * 100 / (grass_wins + grass_losses), 0)
    END AS grass_factor
FROM
    (
        SELECT
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Clay'
                    AND winner = 'Casper Ruud'
            ) AS clay_wins,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Clay'
                    AND loser = 'Casper Ruud'
            ) AS clay_losses,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Hard'
                    AND winner = 'Casper Ruud'
            ) AS hard_wins,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Hard'
                    AND loser = 'Casper Ruud'
            ) AS hard_losses,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Grass'
                    AND winner = 'Casper Ruud'
            ) AS grass_wins,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Grass'
                    AND loser = 'Casper Ruud'
            ) AS grass_losses
    ) AS Q;