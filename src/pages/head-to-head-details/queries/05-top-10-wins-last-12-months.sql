/*
@title
Vinster mot topp 10 senaste 12 månaderna

@description
Visar hur många segrar spelaren har mot topp 10-rankade motståndare de senaste 12 månaderna.

Endast:
- avslutade matcher
- turneringstyper: Grand Slam, Masters, ATP-500 och ATP-250
- huvuddrag (`R128` och uppåt, inga kvalmatcher)
- motståndarens ranking hämtas från matchraden (`loser_rank`)
*/

SELECT
	(
		SELECT COUNT(*)
		FROM flatly
		WHERE winner_id = :playerA
		  AND loser_rank IS NOT NULL
		  AND loser_rank <= 10
		  AND status = 'Completed'
		  AND event_date >= CURDATE() - INTERVAL 12 MONTH
		  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
		  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
	) AS player_a_value,
	(
		SELECT COUNT(*)
		FROM flatly
		WHERE winner_id = :playerB
		  AND loser_rank IS NOT NULL
		  AND loser_rank <= 10
		  AND status = 'Completed'
		  AND event_date >= CURDATE() - INTERVAL 12 MONTH
		  AND event_type IN ('Grand Slam', 'Masters', 'ATP-500', 'ATP-250')
		  AND round IN ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128')
	) AS player_b_value;
