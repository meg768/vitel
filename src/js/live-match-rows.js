import { formatLiveOddsetOddsForMatch, getLiveOddsetOddsStateForMatch } from './live-oddset.js';


function buildHeadToHeadQuery(matches) {
	const pairIds = matches
		.map(match => [match.player?.id, match.opponent?.id].filter(Boolean).sort())
		.filter(pair => pair.length === 2);
	const uniquePairs = [...new Map(pairIds.map(pair => [`${pair[0]}:${pair[1]}`, pair])).values()];

	if (uniquePairs.length === 0) {
		return {
			sql: `
				SELECT
					LEAST(winner_id, loser_id) AS player_a_id,
					GREATEST(winner_id, loser_id) AS player_b_id,
					SUM(winner_id = LEAST(winner_id, loser_id)) AS wins_for_player_a,
					SUM(winner_id = GREATEST(winner_id, loser_id)) AS wins_for_player_b
				FROM flatly
				WHERE 1 = 0
				GROUP BY LEAST(winner_id, loser_id), GREATEST(winner_id, loser_id)
			`,
			format: []
		};
	}

	const whereClauses = uniquePairs
		.map(() => '((winner_id = ? AND loser_id = ?) OR (winner_id = ? AND loser_id = ?))')
		.join(' OR ');
	const format = uniquePairs.flatMap(([playerAId, playerBId]) => [playerAId, playerBId, playerBId, playerAId]);

	return {
		sql: `
			SELECT
				LEAST(winner_id, loser_id) AS player_a_id,
				GREATEST(winner_id, loser_id) AS player_b_id,
				SUM(winner_id = LEAST(winner_id, loser_id)) AS wins_for_player_a,
				SUM(winner_id = GREATEST(winner_id, loser_id)) AS wins_for_player_b
			FROM flatly
			WHERE ${whereClauses}
			GROUP BY LEAST(winner_id, loser_id), GREATEST(winner_id, loser_id)
		`,
		format
	};
}

function addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers, headToHeadByPair) {
	const pairKey = [match.player?.id, match.opponent?.id].filter(Boolean).sort().join(':');
	const record = headToHeadByPair[pairKey];
	const playerWins = record?.[match.player?.id] ?? 0;
	const opponentWins = record?.[match.opponent?.id] ?? 0;
	const rankedMatch = {
		...match,
		eventId: match.event ?? null,
		event: match.name ?? match.event ?? '',
		score: match.score ?? '',
		comment: match.comment ?? null,
		server: match.server ?? null,
		player: {
			...match.player,
			rank: ranksByPlayerId[match.player?.id]
		},
		opponent: {
			...match.opponent,
			rank: ranksByPlayerId[match.opponent?.id]
		}
	};

	return {
		...rankedMatch,
		odds: formatLiveOddsetOddsForMatch(rankedMatch, oddsByPlayers),
		oddsState: getLiveOddsetOddsStateForMatch(rankedMatch, oddsByPlayers),
		headToHead: `${playerWins}-${opponentWins}`,
		opponentHeadToHead: `${opponentWins}-${playerWins}`
	};
}

function selectMonitorMatches(matches, routeParams) {
	if ((routeParams.A && !routeParams.B) || (!routeParams.A && routeParams.B)) {
		return {
			selectedMatches: [],
			error: new Error(`Spelarna hittades inte (${routeParams.A ?? '-'}, ${routeParams.B ?? '-'})`)
		};
	}

	if (routeParams.A && routeParams.B) {
		const requestedA = String(routeParams.A);
		const requestedB = String(routeParams.B);
		const selectedMatch = matches.find(match => String(match.player?.id) === requestedA && String(match.opponent?.id) === requestedB) ?? null;

		if (!selectedMatch) {
			return {
				selectedMatches: [],
				error: new Error(`Matchen hittades inte bland live-matcherna (${routeParams.A}, ${routeParams.B})`)
			};
		}

		return {
			selectedMatches: [selectedMatch],
			error: null
		};
	}

	return {
		selectedMatches: matches.filter(match => !match.winner),
		error: null
	};
}


export { addRankingAndDisplayFields, buildHeadToHeadQuery, selectMonitorMatches };
