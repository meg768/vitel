const LIVE_ODDSET_ATP_MATCHES_URL =
	'https://eu1.offering-api.kambicdn.com/offering/v2018/svenskaspel/listView/tennis/atp/all/all/matches.json?channel_id=1&client_id=200&lang=sv_SE&market=SE&useCombined=true&useCombinedLive=true';
const LIVE_ODDSET_OPEN_URL =
	'https://eu1.offering-api.kambicdn.com/offering/v2018/svenskaspel/event/live/open.json?lang=sv_SE&market=SE&client_id=200&channel_id=1';

const LIVE_ODDSET_QUERY_KEY = ['oddset', 'live', 'atp'];
const ODDS_SOURCE_PRIORITY = {
	MATCHES: 1,
	OPEN: 2
};

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

function toDecimalOdds(odds) {
	if (typeof odds !== 'number') {
		return '-';
	}

	return (odds / 1000).toFixed(2);
}

function getMatchOddsOffer(event) {
	const fromBetOffers = event.betOffers?.find(offer => offer.criterion?.label === 'Matchodds' || offer.criterion?.englishLabel === 'Match Odds');
	if (fromBetOffers) {
		return fromBetOffers;
	}

	if (event.mainBetOffer?.criterion?.label === 'Matchodds' || event.mainBetOffer?.criterion?.englishLabel === 'Match Odds') {
		return event.mainBetOffer;
	}

	return null;
}

function isTrackedState(state) {
	return state === 'STARTED' || state === 'NOT_STARTED';
}

async function fetchJson(url) {
	const response = await fetch(url);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Kunde inte läsa oddset (${response.status})`);
	}

	return response.json();
}

function parseTimestamp(value) {
	if (!value) {
		return 0;
	}

	const ts = Date.parse(value);
	return Number.isNaN(ts) ? 0 : ts;
}

function upsertOddsRow(oddsByPlayers, { oneName, twoName, oneOdds, twoOdds, state, changedDate, sourcePriority }) {
	const key = createPlayersKey(oneName, twoName);
	if (!key) {
		return;
	}

	const next = {
		[normalizeName(oneName)]: toDecimalOdds(oneOdds),
		[normalizeName(twoName)]: toDecimalOdds(twoOdds),
		_state: state ?? null,
		_changedDate: changedDate ?? null,
		_sourcePriority: sourcePriority
	};
	const current = oddsByPlayers[key];

	if (!current) {
		oddsByPlayers[key] = next;
		return;
	}

	const currentPriority = current._sourcePriority ?? 0;
	if (sourcePriority > currentPriority) {
		oddsByPlayers[key] = next;
		return;
	}

	if (sourcePriority < currentPriority) {
		return;
	}

	if (parseTimestamp(changedDate) >= parseTimestamp(current._changedDate)) {
		oddsByPlayers[key] = next;
	}
}

function extractOddsRowsFromMatchesPayload(payload, oddsByPlayers) {
	for (const item of payload.events || []) {
		const state = item.event?.state;
		if (!isTrackedState(state)) {
			continue;
		}

		const offer = getMatchOddsOffer(item);
		if (!offer) {
			continue;
		}

		const one = offer.outcomes?.find(outcome => outcome.type === 'OT_ONE');
		const two = offer.outcomes?.find(outcome => outcome.type === 'OT_TWO');
		const oneName = one?.label || item.event?.homeName;
		const twoName = two?.label || item.event?.awayName;
		const changedDate = [one?.changedDate, two?.changedDate].filter(Boolean).sort().pop() ?? null;

		upsertOddsRow(oddsByPlayers, {
			oneName,
			twoName,
			oneOdds: one?.odds,
			twoOdds: two?.odds,
			state,
			changedDate,
			sourcePriority: ODDS_SOURCE_PRIORITY.MATCHES
		});
	}
}

function extractOddsRowsFromOpenPayload(payload, oddsByPlayers) {
	for (const item of payload.liveEvents || []) {
		if (item.event?.sport !== 'TENNIS') {
			continue;
		}

		const state = item.event?.state;
		if (!isTrackedState(state)) {
			continue;
		}

		const offer = getMatchOddsOffer(item);
		if (!offer) {
			continue;
		}

		const one = offer.outcomes?.find(outcome => outcome.type === 'OT_ONE');
		const two = offer.outcomes?.find(outcome => outcome.type === 'OT_TWO');
		const oneName = one?.label || item.event?.homeName;
		const twoName = two?.label || item.event?.awayName;
		const changedDate = [one?.changedDate, two?.changedDate].filter(Boolean).sort().pop() ?? null;

		upsertOddsRow(oddsByPlayers, {
			oneName,
			twoName,
			oneOdds: one?.odds,
			twoOdds: two?.odds,
			state,
			changedDate,
			sourcePriority: ODDS_SOURCE_PRIORITY.OPEN
		});
	}
}

async function fetchLiveOddsetOddsByPlayers() {
	const [matchesResult, openResult] = await Promise.allSettled([fetchJson(LIVE_ODDSET_ATP_MATCHES_URL), fetchJson(LIVE_ODDSET_OPEN_URL)]);
	const oddsByPlayers = {};
	let hasAtLeastOnePayload = false;

	if (matchesResult.status === 'fulfilled' && matchesResult.value) {
		hasAtLeastOnePayload = true;
		extractOddsRowsFromMatchesPayload(matchesResult.value, oddsByPlayers);
	}

	if (openResult.status === 'fulfilled' && openResult.value) {
		hasAtLeastOnePayload = true;
		extractOddsRowsFromOpenPayload(openResult.value, oddsByPlayers);
	}

	if (!hasAtLeastOnePayload) {
		if (matchesResult.status === 'rejected') {
			throw matchesResult.reason;
		}

		if (openResult.status === 'rejected') {
			throw openResult.reason;
		}
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

export { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers, formatLiveOddsetOddsForMatch, getLiveOddsetOddsStateForMatch };
