DELIMITER $$

CREATE PROCEDURE update_all_surface_factors()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_id INT;

  DECLARE cur CURSOR FOR SELECT id FROM players;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;

  read_loop: LOOP
    FETCH cur INTO v_id;
    IF done THEN
      LEAVE read_loop;
    END IF;

    -- Update surface factors for each player
    UPDATE players
    SET
      clay_factor = (
        SELECT 
          ROUND(100 * COUNT(*) / NULLIF((
            SELECT COUNT(*) FROM flatly WHERE event_surface = 'Clay' AND (winner_id = v_id OR loser_id = v_id)
          ), 0))
        FROM flatly 
        WHERE event_surface = 'Clay' AND winner_id = v_id
      ),
      hard_factor = (
        SELECT 
          ROUND(100 * COUNT(*) / NULLIF((
            SELECT COUNT(*) FROM flatly WHERE event_surface = 'Hard' AND (winner_id = v_id OR loser_id = v_id)
          ), 0))
        FROM flatly 
        WHERE event_surface = 'Hard' AND winner_id = v_id
      ),
      grass_factor = (
        SELECT 
          ROUND(100 * COUNT(*) / NULLIF((
            SELECT COUNT(*) FROM flatly WHERE event_surface = 'Grass' AND (winner_id = v_id OR loser_id = v_id)
          ), 0))
        FROM flatly 
        WHERE event_surface = 'Grass' AND winner_id = v_id
      )
    WHERE id = v_id;

  END LOOP;

  CLOSE cur;
END$$

DELIMITER ;
