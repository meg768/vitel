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

function createPlayersIdKey(playerAId, playerBId) {
	const playerA = String(playerAId || '').trim().toUpperCase();
	const playerB = String(playerBId || '').trim().toUpperCase();

	if (!playerA || !playerB) {
		return null;
	}

	return [playerA, playerB].sort().join('::');
}

function createPlayersIdentityKeys({ playerAId, playerBId, playerAName, playerBName }) {
	return [...new Set([
		createPlayersIdKey(playerAId, playerBId),
		createPlayersKey(playerAName, playerBName)
	].filter(Boolean))];
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

function getStatePriority(state) {
	switch (state) {
		case 'STARTED':
			return 2;
		case 'NOT_STARTED':
			return 1;
		default:
			return 0;
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

async function fetchOddsetRows() {
	const payload = await service.get('oddset');
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
		playerAId: row.playerA?.id ?? null,
		playerBId: row.playerB?.id ?? null,
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
	return toSortedUiRows(await fetchOddsetRows());
}

function shouldReplaceOddsRow(current, next) {
	if (!current) {
		return true;
	}

	const currentPriority = getStatePriority(current._state);
	const nextPriority = getStatePriority(next._state);

	if (nextPriority !== currentPriority) {
		return nextPriority > currentPriority;
	}

	const currentHasOdds = current._hasOdds ?? false;
	const nextHasOdds = next._hasOdds ?? false;

	if (currentHasOdds !== nextHasOdds) {
		return nextHasOdds;
	}

	return false;
}

function upsertOddsRow(oddsByPlayers, { oneId, twoId, oneName, twoName, oneOdds, twoOdds, state }) {
	const keys = createPlayersIdentityKeys({
		playerAId: oneId,
		playerBId: twoId,
		playerAName: oneName,
		playerBName: twoName
	});

	if (keys.length === 0) {
		return;
	}

	const nextRow = {
		[normalizeName(oneName)]: formatOddsValue(oneOdds),
		[normalizeName(twoName)]: formatOddsValue(twoOdds),
		_state: state ?? null,
		_hasOdds: typeof oneOdds === 'number' || typeof twoOdds === 'number'
	};

	for (const key of keys) {
		if (shouldReplaceOddsRow(oddsByPlayers[key], nextRow)) {
			oddsByPlayers[key] = nextRow;
		}
	}
}

async function fetchLiveOddsetOddsByPlayers() {
	const rows = await fetchOddsetRows();
	const oddsByPlayers = {};

	for (const row of rows) {
		if (!row || typeof row !== 'object') {
			continue;
		}

		if (row.state !== 'STARTED' && row.state !== 'NOT_STARTED') {
			continue;
		}

		upsertOddsRow(oddsByPlayers, {
			oneId: row.playerAId,
			twoId: row.playerBId,
			oneName: row.playerA?.name,
			twoName: row.playerB?.name,
			oneOdds: row.playerA?.odds,
			twoOdds: row.playerB?.odds,
			state: row.state
		});
	}

	return oddsByPlayers;
}

function getOddsEntryForMatch(match, oddsByPlayers) {
	const keys = createPlayersIdentityKeys({
		playerAId: match.player?.id,
		playerBId: match.opponent?.id,
		playerAName: match.player?.name,
		playerBName: match.opponent?.name
	});

	for (const key of keys) {
		const entry = oddsByPlayers?.[key];
		if (entry) {
			return entry;
		}
	}

	return null;
}

function formatLiveOddsetOddsForMatch(match, oddsByPlayers) {
	const oddsForMatch = getOddsEntryForMatch(match, oddsByPlayers);
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
	return getOddsEntryForMatch(match, oddsByPlayers)?._state ?? null;
}

function buildPlayerDetailsById(rows = []) {
	const detailsByPlayerId = {};

	for (const row of rows) {
		const key = String(row.id || '').trim().toUpperCase();
		if (!key) {
			continue;
		}

		if (!detailsByPlayerId[key]) {
			detailsByPlayerId[key] = {
				id: row.id || null,
				country: row.country || null
			};
		}
	}

	return detailsByPlayerId;
}

function buildRanksByPlayerId(rows = []) {
	return Object.fromEntries(rows.map((player, index) => [player.id, index + 1]));
}

function resolvePlayer(name, playerId, playerDetailsById, ranksByPlayerId) {
	const normalizedId = String(playerId || '').trim().toUpperCase();
	const playerDetails = normalizedId ? (playerDetailsById[normalizedId] || {}) : {};
	const id = normalizedId || null;

	return {
		id,
		name: name || '-',
		country: playerDetails.country ?? null,
		rank: id ? ranksByPlayerId[id] ?? null : null
	};
}

function resolveMatchPlayers(row, playerDetailsById, ranksByPlayerId) {
	return {
		playerA: resolvePlayer(row.playerAName, row.playerAId, playerDetailsById, ranksByPlayerId),
		playerB: resolvePlayer(row.playerBName, row.playerBId, playerDetailsById, ranksByPlayerId)
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
	buildPlayerDetailsById,
	buildRanksByPlayerId,
	fetchOddsetPipelineMatches,
	fetchLiveOddsetOddsByPlayers,
	formatLiveOddsetOddsForMatch,
	getLiveOddsetOddsStateForMatch,
	resolveMatchPlayers,
	splitOddsetRowsByStatus
};
