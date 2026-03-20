/*
@title
Titlar - Grand Slam/Masters/ATP-500/ATP-250

@description
Visar hur många titlar spelaren har vunnit i Grand Slam, Masters, ATP-500 och ATP-250.

Format:
- `Grand Slam / Masters / ATP-500 / ATP-250`
- noll titlar visas som `-`
*/

SELECT
	(
		SELECT CONCAT(
			CASE WHEN gs_titles = 0 THEN '-' ELSE gs_titles END,
			'/',
			CASE WHEN masters_titles = 0 THEN '-' ELSE masters_titles END,
			'/',
			CASE WHEN atp500_titles = 0 THEN '-' ELSE atp500_titles END,
			'/',
			CASE WHEN atp250_titles = 0 THEN '-' ELSE atp250_titles END
		)
		FROM (
			SELECT
				SUM(event_type = 'Grand Slam' AND round = 'F') AS gs_titles,
				SUM(event_type = 'Masters' AND round = 'F') AS masters_titles,
				SUM(event_type = 'ATP-500' AND round = 'F') AS atp500_titles,
				SUM(event_type = 'ATP-250' AND round = 'F') AS atp250_titles
			FROM flatly
			WHERE winner_id = :playerA
		) player_a_summary
	) AS player_a_value,
	(
		SELECT CONCAT(
			CASE WHEN gs_titles = 0 THEN '-' ELSE gs_titles END,
			'/',
			CASE WHEN masters_titles = 0 THEN '-' ELSE masters_titles END,
			'/',
			CASE WHEN atp500_titles = 0 THEN '-' ELSE atp500_titles END,
			'/',
			CASE WHEN atp250_titles = 0 THEN '-' ELSE atp250_titles END
		)
		FROM (
			SELECT
				SUM(event_type = 'Grand Slam' AND round = 'F') AS gs_titles,
				SUM(event_type = 'Masters' AND round = 'F') AS masters_titles,
				SUM(event_type = 'ATP-500' AND round = 'F') AS atp500_titles,
				SUM(event_type = 'ATP-250' AND round = 'F') AS atp250_titles
			FROM flatly
			WHERE winner_id = :playerB
		) player_b_summary
	) AS player_b_value;
