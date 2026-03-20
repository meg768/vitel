/*
@title
Vinstprocent senaste 12 månaderna

@description
Visar spelarens vinstprocent de senaste 12 månaderna.

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
*/

SELECT
	(
		SELECT CASE
			WHEN COUNT(*) = 0 THEN NULL
			ELSE CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
		END
		FROM (
			SELECT 1 AS win
			FROM flatly
			WHERE winner_id = :playerA
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 12 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

			UNION ALL

			SELECT 0 AS win
			FROM flatly
			WHERE loser_id = :playerA
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 12 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
		) player_a_matches
	) AS player_a_value,
	(
		SELECT CASE
			WHEN COUNT(*) = 0 THEN NULL
			ELSE CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
		END
		FROM (
			SELECT 1 AS win
			FROM flatly
			WHERE winner_id = :playerB
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 12 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

			UNION ALL

			SELECT 0 AS win
			FROM flatly
			WHERE loser_id = :playerB
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 12 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
		) player_b_matches
	) AS player_b_value;
