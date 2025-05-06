DELIMITER $$

DROP PROCEDURE IF EXISTS sp_prospects$$

CREATE PROCEDURE sp_prospects()
BEGIN
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
                event_date >= CURDATE() - INTERVAL 1 YEAR
                AND winner_rank IS NOT NULL
                AND loser_rank IS NOT NULL
                AND winner_rank <= 100
                AND winner_rank >= 50
                AND loser_rank <= 10
            ORDER BY
                winner_rank - loser_rank DESC
        );
END$$
DELIMITER ; 
