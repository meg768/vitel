DELIMITER ;;

DROP PROCEDURE IF EXISTS sp_get_surface_factors;;

CREATE PROCEDURE sp_get_surface_factors(IN player_id VARCHAR(50))
BEGIN
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
                    AND winner_id = player_id
            ) AS clay_wins,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Clay'
                    AND loser_id = player_id
            ) AS clay_losses,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Hard'
                    AND winner_id = player_id
            ) AS hard_wins,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Hard'
                    AND loser_id = player_id
            ) AS hard_losses,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Grass'
                    AND winner_id = player_id
            ) AS grass_wins,
            (
                SELECT
                    COUNT(*)
                FROM
                    flatly
                WHERE
                    event_surface = 'Grass'
                    AND loser_id = player_id
            ) AS grass_losses
    ) AS Q;

END;;
DELIMITER ;