/*
@title
Vinstprocent 3/6/12 månader

@description
Visar spelarens vinstprocent de senaste 3, 6 och 12 månaderna.

Format:
- `3 månader / 6 månader / 12 månader`
- om spelaren inte har spelat några matcher i en period visas `-`

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
*/

SELECT
	(
		SELECT CONCAT(
			COALESCE((
				SELECT CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
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
				) player_a_last_3_months
			), '-'),
			'/',
			COALESCE((
				SELECT CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerA
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerA
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_a_last_6_months
			), '-'),
			'/',
			COALESCE((
				SELECT CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
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
				) player_a_last_12_months
			), '-')
		)
	) AS player_a_value,
	(
		SELECT CONCAT(
			COALESCE((
				SELECT CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
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
				) player_b_last_3_months
			), '-'),
			'/',
			COALESCE((
				SELECT CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerB
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerB
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_b_last_6_months
			), '-'),
			'/',
			COALESCE((
				SELECT CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
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
				) player_b_last_12_months
			), '-')
		)
	) AS player_b_value;
