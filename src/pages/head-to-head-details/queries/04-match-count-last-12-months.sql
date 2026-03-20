/*
@title
Antal matcher senaste 12 månaderna

@description
Visar hur många matcher spelaren har spelat de senaste 12 månaderna.

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
*/

SELECT
	(
		SELECT COUNT(*)
		FROM flatly
		WHERE (winner_id = :playerA OR loser_id = :playerA)
		  AND status = 'Completed'
		  AND event_date >= CURDATE() - INTERVAL 12 MONTH
		  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
		  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
	) AS player_a_value,
	(
		SELECT COUNT(*)
		FROM flatly
		WHERE (winner_id = :playerB OR loser_id = :playerB)
		  AND status = 'Completed'
		  AND event_date >= CURDATE() - INTERVAL 12 MONTH
		  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
		  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
	) AS player_b_value;
