/*
@title
Vinstprocent senaste 3 månaderna

@description
Visar spelarens vinstprocent de senaste 3 månaderna.

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
- minst 5 spelade matcher under perioden
*/

SELECT
	(
		SELECT CASE
			WHEN COUNT(*) < 5 THEN NULL
			ELSE CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
		END
		FROM (
			SELECT 1 AS win
			FROM flatly
			WHERE winner_id = :playerA
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 3 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

			UNION ALL

			SELECT 0 AS win
			FROM flatly
			WHERE loser_id = :playerA
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 3 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
		) player_a_matches
	) AS player_a_value,
	(
		SELECT CASE
			WHEN COUNT(*) < 5 THEN NULL
			ELSE CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
		END
		FROM (
			SELECT 1 AS win
			FROM flatly
			WHERE winner_id = :playerB
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 3 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

			UNION ALL

			SELECT 0 AS win
			FROM flatly
			WHERE loser_id = :playerB
			  AND status = 'Completed'
			  AND event_date >= CURDATE() - INTERVAL 3 MONTH
			  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
			  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
		) player_b_matches
	) AS player_b_value;
