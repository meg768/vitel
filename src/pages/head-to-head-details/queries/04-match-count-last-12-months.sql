/*
@title
Antal matcher 3/6/12 månader

@description
Visar hur många matcher spelaren har spelat de senaste 3, 6 och 12 månaderna.

Format:
- `3 månader / 6 månader / 12 månader`

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
*/

SELECT
	CAST((
		SELECT CONCAT(
			(
				SELECT COUNT(*)
				FROM flatly
				WHERE (winner_id = :playerA OR loser_id = :playerA)
				  AND status = 'Completed'
				  AND event_date >= CURDATE() - INTERVAL 3 MONTH
				  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
				  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
			),
			'/',
			(
				SELECT COUNT(*)
				FROM flatly
				WHERE (winner_id = :playerA OR loser_id = :playerA)
				  AND status = 'Completed'
				  AND event_date >= CURDATE() - INTERVAL 6 MONTH
				  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
				  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
			),
			'/',
			(
				SELECT COUNT(*)
				FROM flatly
				WHERE (winner_id = :playerA OR loser_id = :playerA)
				  AND status = 'Completed'
				  AND event_date >= CURDATE() - INTERVAL 12 MONTH
				  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
				  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
			)
		)
	) AS CHAR) AS player_a_value,
	CAST((
		SELECT CONCAT(
			(
				SELECT COUNT(*)
				FROM flatly
				WHERE (winner_id = :playerB OR loser_id = :playerB)
				  AND status = 'Completed'
				  AND event_date >= CURDATE() - INTERVAL 3 MONTH
				  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
				  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
			),
			'/',
			(
				SELECT COUNT(*)
				FROM flatly
				WHERE (winner_id = :playerB OR loser_id = :playerB)
				  AND status = 'Completed'
				  AND event_date >= CURDATE() - INTERVAL 6 MONTH
				  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
				  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
			),
			'/',
			(
				SELECT COUNT(*)
				FROM flatly
				WHERE (winner_id = :playerB OR loser_id = :playerB)
				  AND status = 'Completed'
				  AND event_date >= CURDATE() - INTERVAL 12 MONTH
				  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
				  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
			)
		)
	) AS CHAR) AS player_b_value;
