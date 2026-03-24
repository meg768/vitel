import { service } from './vitel.js';

const ODDSET_PIPELINE_QUERY_KEY = ['oddset', 'pipeline', 'atp'];
const LIVE_ODDSET_QUERY_KEY = ['oddset', 'live', 'atp'];
const ODDSET_PIPELINE_REFRESH_INTERVAL_MS = 25 * 1000;

function normalizeName(name = '') {
	return String(name)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function createPlayersKey(playerAName, playerBName) {
	const playerA = normalizeName(playerAName);
	const playerB = normalizeName(playerBName);

	if (!playerA || !playerB) {
		return null;
	}

	return [playerA, playerB].sort().join('::');
}

function formatOddsValue(odds) {
	if (typeof odds !== 'number') {
		return '-';
	}

	return odds.toFixed(2);
}

function formatState(state) {
	switch (state) {
		case 'STARTED':
			return 'Live';
		case 'NOT_STARTED':
			return 'Kommande';
		default:
			return state || '-';
	}
}

function formatStart(value) {
	if (!value) {
		return '-';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '-';
	}

	function startOfLocalDay(d) {
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	}

	const today = startOfLocalDay(new Date());
	const targetDay = startOfLocalDay(date);
	const diffDays = Math.round((targetDay - today) / (24 * 60 * 60 * 1000));
	const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
	let dayLabel = '';

	switch (diffDays) {
		case -1:
			dayLabel = 'I går';
			break;
		case 0:
			dayLabel = 'Idag';
			break;
		case 1:
			dayLabel = 'I morgon';
			break;
		case 2:
			dayLabel = 'I övermorgon';
			break;
		default:
			dayLabel = diffDays > 0 ? `Om ${diffDays} dagar` : `${Math.abs(diffDays)} dagar sedan`;
			break;
	}

	return `${dayLabel} ${time}`;
}

function parseStartTimestamp(value) {
	const ts = Date.parse(value);
	return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts;
}

async function fetchOddsetRows({ states } = {}) {
	const params = new URLSearchParams();

	if (Array.isArray(states) && states.length > 0) {
		params.set('states', states.join(','));
	}

	const path = params.size > 0 ? `oddset?${params.toString()}` : 'oddset';
	const payload = await service.get(path);
	return normalizeOddsetRowsPayload(payload);
}

function normalizeOddsetRowsPayload(payload) {
	if (!Array.isArray(payload)) {
		throw new Error('Oddset endpoint returnerade inte en array');
	}

	const isValid = payload.every(
		row =>
			row &&
			typeof row === 'object' &&
			row.playerA &&
			typeof row.playerA === 'object' &&
			row.playerB &&
			typeof row.playerB === 'object'
	);

	if (!isValid) {
		throw new Error('Oddset endpoint har oväntat format');
	}

	return payload;
}

function toUiRow(row) {
	const playerAName = row.playerA?.name;
	const playerBName = row.playerB?.name;
	const oddsA = row.playerA?.odds;
	const oddsB = row.playerB?.odds;
	const liveScore = row.score ?? null;
	const rawState = row.state ?? (liveScore ? 'STARTED' : 'NOT_STARTED');

	return {
		id: row.id ?? `${playerAName ?? '-'}-${playerBName ?? '-'}-${row.start ?? '-'}`,
		turnering: row.tournament ?? '-',
		playerAName: playerAName || '-',
		playerBName: playerBName || '-',
		odds: `${formatOddsValue(oddsA)} - ${formatOddsValue(oddsB)}`,
		liveScore: liveScore || '-',
		status: formatState(rawState),
		start: formatStart(row.start),
		_startTimestamp: Number.isFinite(row._startTimestamp) ? row._startTimestamp : parseStartTimestamp(row.start)
	};
}

function toSortedUiRows(rows = []) {
	const mapped = rows.map(toUiRow);
	mapped.sort((a, b) => a._startTimestamp - b._startTimestamp);
	return mapped;
}

async function fetchOddsetPipelineMatches() {
	const rows = await fetchOddsetRows();
	return toSortedUiRows(rows);
}

function upsertOddsRow(oddsByPlayers, { oneName, twoName, oneOdds, twoOdds, state }) {
	const key = createPlayersKey(oneName, twoName);
	if (!key) {
		return;
	}

	oddsByPlayers[key] = {
		[normalizeName(oneName)]: formatOddsValue(oneOdds),
		[normalizeName(twoName)]: formatOddsValue(twoOdds),
		_state: state ?? null
	};
}

async function fetchLiveOddsetOddsByPlayers() {
	const rows = await fetchOddsetRows({ states: ['STARTED'] });
	const oddsByPlayers = {};

	for (const row of rows) {
		if (!row || typeof row !== 'object') {
			continue;
		}

		upsertOddsRow(oddsByPlayers, {
			oneName: row.playerA?.name,
			twoName: row.playerB?.name,
			oneOdds: row.playerA?.odds,
			twoOdds: row.playerB?.odds,
			state: row.state
		});
	}

	return oddsByPlayers;
}

function formatLiveOddsetOddsForMatch(match, oddsByPlayers) {
	const key = createPlayersKey(match.player?.name, match.opponent?.name);
	if (!key) {
		return '-';
	}

	const oddsForMatch = oddsByPlayers?.[key];
	if (!oddsForMatch) {
		return '-';
	}

	const playerOdds = oddsForMatch[normalizeName(match.player?.name)] ?? '-';
	const opponentOdds = oddsForMatch[normalizeName(match.opponent?.name)] ?? '-';

	if (playerOdds === '-' && opponentOdds === '-') {
		return '-';
	}

	return `${playerOdds} - ${opponentOdds}`;
}

function getLiveOddsetOddsStateForMatch(match, oddsByPlayers) {
	const key = createPlayersKey(match.player?.name, match.opponent?.name);
	if (!key) {
		return null;
	}

	return oddsByPlayers?.[key]?._state ?? null;
}

function buildPlayerDetailsByName(rows = []) {
	const detailsByPlayerName = {};

	for (const row of rows) {
		const key = normalizeName(row.name);
		if (!key) {
			continue;
		}

		if (!detailsByPlayerName[key]) {
			detailsByPlayerName[key] = {
				id: row.id || null,
				country: row.country || null
			};
		}
	}

	return detailsByPlayerName;
}

function buildRanksByPlayerId(rows = []) {
	return Object.fromEntries(rows.map((player, index) => [player.id, index + 1]));
}

function resolvePlayer(name, playerDetailsByName, ranksByPlayerId) {
	const playerDetails = playerDetailsByName[normalizeName(name)] || {};

	return {
		id: playerDetails.id ?? null,
		name: name || '-',
		country: playerDetails.country ?? null,
		rank: playerDetails.id ? ranksByPlayerId[playerDetails.id] ?? null : null
	};
}

function resolveMatchPlayers(row, playerDetailsByName, ranksByPlayerId) {
	return {
		playerA: resolvePlayer(row.playerAName, playerDetailsByName, ranksByPlayerId),
		playerB: resolvePlayer(row.playerBName, playerDetailsByName, ranksByPlayerId)
	};
}

function splitOddsetRowsByStatus(rows) {
	const liveMatches = [];
	const upcomingMatches = [];

	for (const row of rows) {
		if (row.status === 'Live') {
			liveMatches.push(row);
		} else {
			upcomingMatches.push(row);
		}
	}

	return { liveMatches, upcomingMatches };
}

export {
	LIVE_ODDSET_QUERY_KEY,
	ODDSET_PIPELINE_QUERY_KEY,
	ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
	buildPlayerDetailsByName,
	buildRanksByPlayerId,
	fetchOddsetPipelineMatches,
	fetchLiveOddsetOddsByPlayers,
	formatLiveOddsetOddsForMatch,
	getLiveOddsetOddsStateForMatch,
	resolveMatchPlayers,
	splitOddsetRowsByStatus
};
