/*
@title
Inbördes möte

@description
Visar den totala head-to-head-ställningen mellan spelarna, räknat som antal segrar mot just den andra spelaren.
*/

SELECT
	(
		SELECT COUNT(*)
		FROM flatly
		WHERE winner_id = :playerA
		  AND loser_id = :playerB
	) AS player_a_value,
	(
		SELECT COUNT(*)
		FROM flatly
		WHERE winner_id = :playerB
		  AND loser_id = :playerA
	) AS player_b_value;
