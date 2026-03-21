/*
@title
Vinstprocent mot bättre rankade 3/6/12 månader

@description
Visar spelarens vinstprocent mot bättre rankade motståndare de senaste 3, 6 och 12 månaderna.

Format:
- `3 månader / 6 månader / 12 månader`
- om spelaren har färre än 5 matcher i en period visas `-`

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
- ranking hämtas från matchraden (`winner_rank` och `loser_rank`)
- bättre rankad betyder lägre rankingnummer än spelaren själv
*/

SELECT
	(
		SELECT CONCAT(
			COALESCE((
				SELECT CASE
					WHEN COUNT(*) >= 5 THEN CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
					ELSE '-'
				END
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerA
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND loser_rank < winner_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 3 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerA
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND winner_rank < loser_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 3 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_a_last_3_months
			), '-'),
			'/',
			COALESCE((
				SELECT CASE
					WHEN COUNT(*) >= 5 THEN CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
					ELSE '-'
				END
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerA
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND loser_rank < winner_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerA
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND winner_rank < loser_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_a_last_6_months
			), '-'),
			'/',
			COALESCE((
				SELECT CASE
					WHEN COUNT(*) >= 5 THEN CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
					ELSE '-'
				END
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerA
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND loser_rank < winner_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 12 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerA
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND winner_rank < loser_rank
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
				SELECT CASE
					WHEN COUNT(*) >= 5 THEN CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
					ELSE '-'
				END
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerB
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND loser_rank < winner_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 3 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerB
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND winner_rank < loser_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 3 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_b_last_3_months
			), '-'),
			'/',
			COALESCE((
				SELECT CASE
					WHEN COUNT(*) >= 5 THEN CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
					ELSE '-'
				END
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerB
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND loser_rank < winner_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerB
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND winner_rank < loser_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 6 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_b_last_6_months
			), '-'),
			'/',
			COALESCE((
				SELECT CASE
					WHEN COUNT(*) >= 5 THEN CONCAT(ROUND(100 * SUM(win) / COUNT(*), 0), '%')
					ELSE '-'
				END
				FROM (
					SELECT 1 AS win
					FROM flatly
					WHERE winner_id = :playerB
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND loser_rank < winner_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 12 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')

					UNION ALL

					SELECT 0 AS win
					FROM flatly
					WHERE loser_id = :playerB
					  AND winner_rank IS NOT NULL
					  AND loser_rank IS NOT NULL
					  AND winner_rank < loser_rank
					  AND status = 'Completed'
					  AND event_date >= CURDATE() - INTERVAL 12 MONTH
					  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
					  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
				) player_b_last_12_months
			), '-')
		)
	) AS player_b_value;
