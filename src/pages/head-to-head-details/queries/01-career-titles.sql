/*
@title
Vunna titlar

@description
Visar hur många officiella singeltitlar varje spelare har vunnit totalt i sin karriär, baserat på `players.career_titles`.
*/

SELECT
	COALESCE((
		SELECT career_titles
		FROM players
		WHERE id = :playerA
	), 0) AS player_a_value,
	COALESCE((
		SELECT career_titles
		FROM players
		WHERE id = :playerB
	), 0) AS player_b_value;
